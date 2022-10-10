import { BigNumber } from "ethers";
import { UserTx } from "v2/types";

export const generatePnL = (userJarHistory: UserTx[]) => {
  const pnl: (PnlTxn | undefined)[] = userJarHistory.map((txn) => {
    if (txn.transaction_type === "ZAPIN") {
      return handleZap(txn);
    }
    if (txn.transaction_type === "DEPOSIT") {
      return handleDeposit(txn);
    }
    if (txn.transaction_type === "WITHDRAW") {
      return handleWithdraw(txn);
    }
    // TODO add stake and unstake here
  });
  const pnlWithTotals: PnlTxnWithTotals[] = [];
  pnl.forEach((txn, i) => {
    if (i === 0 && txn) {
      pnlWithTotals.push(firstPnlItem(txn));
      return;
    } else {
      if (!txn) {
        if (pnlWithTotals.length > 0) {
          pnlWithTotals.push({
            ...pnlWithTotals[i - 1],
            action: "other",
            nTokens: BigNumber.from(0),
            pl: undefined,
          });
        }
        return;
      }
      let entry: PnlTxnWithTotals;
      if (txn.action === "deposit") {
        entry = getDepositPnlEntry(txn, pnlWithTotals, i);
        pnlWithTotals.push(entry);
        return;
      }
      if (txn.action === "withdraw") {
        entry = getWithdrawPnlEntry(txn, pnlWithTotals, i);
        pnlWithTotals.push(entry);
      }
      // TODO add stake and unstake locking of tokens
      if (txn.action === "stake") {
        // lock tokens from earliest lots
      }
      if (txn.action === "unstake") {
        // unlock tokens from earliest lots
      }
    }
  });
  return pnlWithTotals;
};

const handleZap = (txn: UserTx): PnlTxn => {
  let value = 0;
  let nTokens = BigNumber.from(0);
  let tokenDecimals = 18;
  txn.transfers.forEach((transfer) => {
    if (transfer.transfer_type === "FROM_CALLER") value = +transfer.value.toFixed(2);
    if (transfer.transfer_type === "PTRANSFER") {
      nTokens = BigNumber.from(transfer.amount);
      if (transfer.decimals) tokenDecimals = transfer.decimals;
    }
  });
  const { costBasis, costBasisDecimals } = getCostBasis(value, nTokens);
  DEBUG_OUT("handleZap VALUE: ", value);
  DEBUG_OUT("handleZap N TOKENS: ", nTokens.toString());
  DEBUG_OUT("handleZap cost basis: ", costBasis);
  const ret: PnlTxn = {
    action: "deposit",
    value: value,
    nTokens: nTokens,
    tokenDecimals: tokenDecimals,
    costBasis: costBasis,
    costBasisDecimals: costBasisDecimals,
    hash: txn.hash,
    timestamp: txn.timestamp,
  };
  return ret;
};

const handleDeposit = (txn: UserTx) => {
  let value = 0;
  let nTokens = BigNumber.from(0);
  let tokenDecimals = 18;
  txn.transfers.forEach((transfer) => {
    if (transfer.transfer_type === "DEPOSIT") nTokens = BigNumber.from(transfer.amount);
    if (transfer.transfer_type === "WANT_DEPOSIT") {
      value = +transfer.value.toFixed(2);
      if (transfer.decimals) tokenDecimals = transfer.decimals;
    }
  });
  const ret: PnlTxn = {
    action: "deposit",
    value: value,
    nTokens: nTokens,
    tokenDecimals: tokenDecimals,
    costBasis: BigNumber.from(Math.floor(value * 1e9)).div(nTokens),
    costBasisDecimals: 9,
    hash: txn.hash,
    timestamp: txn.timestamp,
  };

  return ret;
};

const handleWithdraw = (txn: UserTx) => {
  let value = 0;
  let nTokens = BigNumber.from(0);
  let tokenDecimals = 18;
  txn.transfers.forEach((transfer) => {
    if (transfer.transfer_type === "WITHDRAW") nTokens = BigNumber.from(transfer.amount);
    if (transfer.transfer_type === "WANT_WITHDRAW") {
      value = +transfer.value.toFixed(2);
      if (transfer.decimals) tokenDecimals = transfer.decimals;
    }
  });
  const ret: PnlTxn = {
    action: "withdraw",
    value: value,
    nTokens: nTokens,
    tokenDecimals: tokenDecimals,
    costBasis: BigNumber.from(Math.floor(value * 1e9)).div(nTokens),
    costBasisDecimals: 9,
    hash: txn.hash,
    timestamp: txn.timestamp,
  };
  return ret;
};

const getDepositPnlEntry = (
  txn: PnlTxn,
  pnlWithTotals: PnlTxnWithTotals[],
  i: number,
): PnlTxnWithTotals => {
  const totalNTokens = pnlWithTotals[i - 1].totalNTokens.add(txn.nTokens);
  const totalCost = pnlWithTotals[i - 1].totalCost + txn.value;
  const totalCostBasis = BigNumber.from(Math.floor(totalCost * 1e9)).div(totalNTokens);

  let lots = [...pnlWithTotals[i - 1].lots];
  lots.push({
    nTokens: txn?.nTokens,
    nTokensRemaining: txn?.nTokens,
    nTokensLocked: BigNumber.from(0),
    tokenDecimals: txn.tokenDecimals,
    costBasis: txn.costBasis,
    costBasisDecimals: 9,
    status: "open",
    timestamp: txn.timestamp,
  });
  return {
    ...txn,
    totalNTokens: totalNTokens,
    totalCostBasis: totalCostBasis,
    totalCost: totalCost,
    lots: lots,
  };
};

const getWithdrawPnlEntry = (
  txn: PnlTxn,
  pnlWithTotals: PnlTxnWithTotals[],
  i: number,
): PnlTxnWithTotals => {
  let totalNTokens = pnlWithTotals[i - 1].totalNTokens.sub(txn.nTokens);
  let totalCostBasis = pnlWithTotals[i - 1].totalNTokens.sub(txn.nTokens).eq(0)
    ? BigNumber.from(0)
    : pnlWithTotals[i - 1].totalNTokens
        .mul(pnlWithTotals[i - 1].totalCostBasis)
        .sub(txn.nTokens.mul(txn.costBasis))
        .div(pnlWithTotals[i - 1].totalNTokens.sub(txn.nTokens));
  let lots = [...pnlWithTotals[i - 1].lots];
  let nt = txn.nTokens;
  let cost = 0;
  lots = lots.map((l) => {
    if (nt.eq(0) || l.status === "closed") return l;
    if (l.nTokensRemaining.sub(nt).gt(0)) {
      let ret = { ...l, nTokensRemaining: l.nTokensRemaining.sub(nt) } as Lot;
      cost += getCost(l.nTokensRemaining, ret.costBasis, ret.tokenDecimals);
      nt = BigNumber.from(0);
      return ret;
    } else {
      let ret = { ...l, nTokensRemaining: BigNumber.from(0), status: "closed" } as Lot;
      nt = nt.sub(l.nTokensRemaining);
      cost += getCost(l.nTokensRemaining, ret.costBasis, ret.tokenDecimals);
      return ret;
    }
  });
  const totalCost =
    totalNTokens.mul(totalCostBasis).toNumber() / Math.pow(10, txn.costBasisDecimals);
  return {
    ...txn,
    totalNTokens: totalNTokens,
    totalCostBasis: totalCostBasis,
    totalCost: totalCost,
    pl: txn.value - cost,
    lots: lots,
  };
};

// TODO handleStake and handleUnstake
// const handleStake = (txn: UserTx) => {
//   return;
// };
// const handleUnstake = (txn: UserTx) => {
//   return;
// };

const firstPnlItem = (txn: PnlTxn): PnlTxnWithTotals => {
  return {
    ...txn,
    totalNTokens: txn?.nTokens,
    totalCostBasis: txn?.costBasis,
    totalCost: txn.value,
    lots: [
      {
        nTokens: txn?.nTokens,
        nTokensRemaining: txn?.nTokens,
        nTokensLocked: BigNumber.from(0),
        tokenDecimals: txn.tokenDecimals,
        costBasis: txn.costBasis,
        costBasisDecimals: txn.costBasisDecimals,
        status: "open",
        timestamp: txn.timestamp,
      },
    ],
  };
};

const getCostBasis = (value: number, nTokens: BigNumber) => {
  let decimals = 0;
  let costBasis = BigNumber.from(0);
  const usdWei = BigNumber.from(Math.floor(value * 100))
    .mul(1e9)
    .mul(1e7);
  if (usdWei.gte(nTokens)) {
    costBasis = usdWei.div(nTokens);
  } else {
    costBasis = usdWei.mul(1e9).div(nTokens);
    decimals = 9;
  }
  return { costBasis: costBasis, costBasisDecimals: decimals };
};
const getCost = (nTokens: BigNumber, costBasis: BigNumber, tokenDecimals: number) => {
  let cost = 0;
  if (costBasis.eq(0)) return 0;
  cost =
    nTokens
      .mul(costBasis)
      .div(1e6)
      .div(Math.pow(10, tokenDecimals - 9))
      .toNumber() / 1e3;
  return cost;
};
export interface PnlTxn {
  action: "deposit" | "withdraw" | "stake" | "unstake" | "other";
  value: number;
  nTokens: BigNumber;
  tokenDecimals: number;
  costBasis: BigNumber;
  costBasisDecimals: number;
  hash: string;
  timestamp: number;
}
export interface PnlTxnWithTotals extends PnlTxn {
  totalNTokens: BigNumber;
  totalCostBasis: BigNumber;
  totalCost: number;
  pl?: number;
  // totalTradingPnL?: number;
  // totalRewardsUSD?: number;
  lots: Lot[];
}
interface Lot {
  nTokens: BigNumber;
  nTokensRemaining: BigNumber;
  nTokensLocked: BigNumber;
  tokenDecimals: number;
  costBasis: BigNumber;
  costBasisDecimals: number;
  status: "open" | "locked" | "closed";
  timestamp: number;
}

const DEBUG_OUT = (label: string, msg: any) => {
  if (GLOBAL_DEBUG) console.log(label + "\n", msg);
};
const GLOBAL_DEBUG = true;
