import { BigNumber } from "ethers";
import { UserTx } from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";

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
  let costBasis = 0;
  txn.transfers.forEach((transfer) => {
    if (transfer.transfer_type === "FROM_CALLER") value = +transfer.value.toFixed(2);
    if (transfer.transfer_type === "PTRANSFER") {
      nTokens = BigNumber.from(transfer.amount);
      if (transfer.decimals) tokenDecimals = transfer.decimals;
      costBasis = +transfer.price;
    }
  });
  DEBUG_OUT("handleZap VALUE: ", value);
  DEBUG_OUT("handleZap N TOKENS: ", nTokens.toString());
  const ret: PnlTxn = {
    action: "deposit",
    value: value,
    nTokens: nTokens,
    tokenDecimals: tokenDecimals,
    costBasis: costBasis,
    hash: txn.hash,
    timestamp: txn.timestamp,
  };
  return ret;
};

const handleDeposit = (txn: UserTx) => {
  let value = 0;
  let nTokens = BigNumber.from(0);
  let tokenDecimals = 18;
  let costBasis = 0;
  txn.transfers.forEach((transfer) => {
    if (transfer.transfer_type === "DEPOSIT") nTokens = BigNumber.from(transfer.amount);
    if (transfer.transfer_type === "WANT_DEPOSIT") {
      value = +transfer.value.toFixed(2);
      if (transfer.decimals) tokenDecimals = transfer.decimals;
      costBasis = +transfer.price;
    }
  });
  const ret: PnlTxn = {
    action: "deposit",
    value: value,
    nTokens: nTokens,
    tokenDecimals: tokenDecimals,
    costBasis: costBasis,
    hash: txn.hash,
    timestamp: txn.timestamp,
  };

  return ret;
};

const handleWithdraw = (txn: UserTx) => {
  let value = 0;
  let nTokens = BigNumber.from(0);
  let tokenDecimals = 18;
  let costBasis = 0;
  txn.transfers.forEach((transfer) => {
    if (transfer.transfer_type === "WITHDRAW") nTokens = BigNumber.from(transfer.amount);
    if (transfer.transfer_type === "WANT_WITHDRAW") {
      value = +transfer.value.toFixed(2);
      if (transfer.decimals) tokenDecimals = transfer.decimals;
      costBasis = +transfer.price;
    }
  });
  const ret: PnlTxn = {
    action: "withdraw",
    value: value,
    nTokens: nTokens,
    tokenDecimals: tokenDecimals,
    costBasis: costBasis,
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

  const totalCostBasis =
    BigNumber.from(Math.floor(totalCost * 1e9))
      .div(totalNTokens)
      .toNumber() / 1e9;

  let lots = [...pnlWithTotals[i - 1].lots];
  lots.push({
    nTokens: txn?.nTokens,
    nTokensRemaining: txn?.nTokens,
    nTokensLocked: BigNumber.from(0),
    tokenDecimals: txn.tokenDecimals,
    costBasis: txn.costBasis,
    cost: txn.value,
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
      cost += l.cost;
      nt = BigNumber.from(0);
      return ret;
    } else {
      let ret = { ...l, nTokensRemaining: BigNumber.from(0), status: "closed" } as Lot;
      nt = nt.sub(l.nTokensRemaining);
      cost += l.cost;
      return ret;
    }
  });
  const totalCost = totalNTokens.mul(totalCostBasis).toNumber();
  return {
    ...txn,
    totalNTokens: totalNTokens,
    totalCostBasis: totalCostBasis.toNumber(),
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
        cost: txn.value,
        status: "open",
        timestamp: txn.timestamp,
      },
    ],
  };
};

const getCost = (nTokens: BigNumber, costBasis: number, tokenDecimals: number) => {
  let cost = 0;
  if (costBasis === 0) return 0;
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
  costBasis: number;
  hash: string;
  timestamp: number;
}
export interface PnlTxnWithTotals extends PnlTxn {
  totalNTokens: BigNumber;
  totalCostBasis: number;
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
  costBasis: number;
  cost: number;
  status: "open" | "locked" | "closed";
  timestamp: number;
}

const xTimesTenToTheN = (x: BigNumber | number, n: number) => {
  if (typeof x === "number") x = BigNumber.from(Math.floor(x * 1e3));
  while (n > 0) {
    if (n < 9) {
      x = x.mul(Math.pow(10, n));
      n = 0;
    } else {
      x = x.mul(Math.pow(10, 9));
      n -= 9;
    }
  }
  return x.div(1e3);
};
const xDivTenToTheN = (x: BigNumber | number, n: number) => {
  if (typeof x === "number") x = BigNumber.from(Math.floor(x * 1e3));
  while (n > 0) {
    if (x.lte(1e9))
      return {
        x: x,
        underflowDigits: n,
      };
    if (n < 9) {
      x = x.div(Math.pow(10, n));
      n = 0;
    } else {
      x = x.div(Math.pow(10, 9));
      n -= 9;
    }
  }
  return { x: x.div(1e3) };
};

const DEBUG_OUT = (label: string, msg: any) => {
  if (GLOBAL_DEBUG) console.log(label + "\n", msg);
};
const GLOBAL_DEBUG = true;
