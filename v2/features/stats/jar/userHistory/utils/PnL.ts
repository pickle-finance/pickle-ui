import { UserTx } from "v2/types";

export const generatePnL = (userJarHistory: UserTx[]) => {
  // add checks on reverse txn list to find valid starting point
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
            nTokens: 0,
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

const getDepositPnlEntry = (
  txn: PnlTxn,
  pnlWithTotals: PnlTxnWithTotals[],
  i: number,
): PnlTxnWithTotals => {
  let totalNTokens = pnlWithTotals[i - 1].totalNTokens + txn.nTokens;
  let totalCostBasis =
    (pnlWithTotals[i - 1].totalCostBasis * pnlWithTotals[i - 1].totalNTokens +
      txn.costBasis * txn.nTokens) /
    (pnlWithTotals[i - 1].totalNTokens + txn.nTokens);
  let pl = undefined;
  let lots = [...pnlWithTotals[i - 1].lots];
  lots.push({
    nTokens: txn?.nTokens,
    nTokensRemaining: txn?.nTokens,
    costBasis: txn.costBasis,
    status: "open",
    timestamp: txn.timestamp,
  });
  return {
    ...txn,
    totalNTokens: totalNTokens,
    totalCostBasis: totalCostBasis,
    totalCost: totalNTokens * totalCostBasis,
    pl: pl,
    lots: lots,
  };
};

const getWithdrawPnlEntry = (
  txn: PnlTxn,
  pnlWithTotals: PnlTxnWithTotals[],
  i: number,
): PnlTxnWithTotals => {
  let totalNTokens = pnlWithTotals[i - 1].totalNTokens - txn.nTokens;
  // this is handling small calculation issues from rounding and whatnot
  // TODO probably fix math and remove the following line
  if (-1 < totalNTokens && totalNTokens < 0) totalNTokens = 0;
  let totalCostBasis =
    pnlWithTotals[i - 1].totalNTokens - txn.nTokens === 0
      ? 0
      : (pnlWithTotals[i - 1].totalCostBasis * pnlWithTotals[i - 1].totalNTokens -
          txn.costBasis * txn.nTokens) /
        (pnlWithTotals[i - 1].totalNTokens - txn.nTokens);
  let lots = [...pnlWithTotals[i - 1].lots];
  let nt = txn.nTokens;
  let cost = 0;
  console.log("global nt: ", nt);
  lots = lots.map((l) => {
    if (nt === 0 || l.status === "closed") return l;
    if (l.nTokensRemaining - nt > 0) {
      let ret = { ...l, nTokensRemaining: l.nTokensRemaining - nt } as Lot;
      cost += ret.nTokens * ret.costBasis;
      console.log("NTOKENS > 0: ", ret);
      return ret;
    } else {
      let ret = { ...l, nTokensRemaining: 0, status: "closed" } as Lot;
      nt = nt - l.nTokensRemaining;
      cost += l.nTokensRemaining * ret.costBasis;
      console.log("STATUS SHOULD BE CLOSED", ret);
      return ret;
    }
  });
  console.log("LOTS: ", lots);
  return {
    ...txn,
    totalNTokens: totalNTokens,
    totalCostBasis: totalCostBasis,
    totalCost: totalNTokens * totalCostBasis,
    pl: txn.value - cost,
    lots: lots,
  };
};

const handleZap = (txn: UserTx): PnlTxn => {
  let value = 0;
  let nTokens = 0;
  txn.transfers.forEach((transfer) => {
    if (transfer.transfer_type === "FROM_CALLER") value = transfer.value;
    if (transfer.transfer_type === "PTRANSFER") {
      nTokens =
        transfer.value / +transfer.price < 1
          ? +(transfer.value / +transfer.price).toFixed(6)
          : +(transfer.value / +transfer.price).toFixed(2);
    }
  });
  const ret: PnlTxn = {
    action: "deposit",
    value: value,
    nTokens: nTokens,
    costBasis: value / nTokens,
    hash: txn.hash,
    timestamp: txn.timestamp,
  };
  return ret;
};

const handleDeposit = (txn: UserTx) => {
  let value = 0;
  let nTokens = 0;
  txn.transfers.forEach((transfer) => {
    if (transfer.transfer_type === "DEPOSIT")
      nTokens =
        transfer.value / +transfer.price < 1
          ? +(transfer.value / +transfer.price).toFixed(6)
          : +(transfer.value / +transfer.price).toFixed(2);
    if (transfer.transfer_type === "WANT_DEPOSIT") value = transfer.value;
  });
  const ret: PnlTxn = {
    action: "deposit",
    value: value,
    nTokens: nTokens,
    costBasis: value / nTokens,
    hash: txn.hash,
    timestamp: txn.timestamp,
  };

  return ret;
};

const handleWithdraw = (txn: UserTx) => {
  let value = 0;
  let nTokens = 0;
  txn.transfers.forEach((transfer) => {
    if (transfer.transfer_type === "WITHDRAW")
      nTokens =
        transfer.value / +transfer.price < 1
          ? +(transfer.value / +transfer.price).toFixed(6)
          : +(transfer.value / +transfer.price).toFixed(2);
    if (transfer.transfer_type === "WANT_WITHDRAW") value = transfer.value;
  });
  const ret: PnlTxn = {
    action: "withdraw",
    value: value,
    nTokens: nTokens,
    costBasis: value / nTokens,
    hash: txn.hash,
    timestamp: txn.timestamp,
  };
  return ret;
};

// TODO handleStake and handleUnstake
// const handleStake = (txn: UserTx) => {
//   return;
// }
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
        costBasis: txn.costBasis,
        status: "open",
        timestamp: txn.timestamp,
      },
    ],
  };
};

const DEBUG_OUT = (msg: any) => {
  if (GLOBAL_DEBUG) console.log(msg);
};
const GLOBAL_DEBUG = true;

export interface PnlTxn {
  action: "deposit" | "withdraw" | "stake" | "unstake" | "other";
  value: number;
  nTokens: number;
  costBasis: number;
  hash: string;
  timestamp: number;
}

export interface PnlTxnWithTotals extends PnlTxn {
  totalNTokens: number;
  totalCostBasis: number;
  totalCost: number;
  pl?: number;
  totalTradingPnL?: number;
  totalRewardsUSD?: number;
  lots: Lot[];
}

interface Lot {
  nTokens: number;
  nTokensRemaining: number;
  costBasis: number;
  status: "open" | "locked" | "closed";
  timestamp: number;
}
