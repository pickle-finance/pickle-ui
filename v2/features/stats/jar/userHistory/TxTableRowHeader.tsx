import { ChevronDownIcon } from "@heroicons/react/solid";
import { PickleModelJson } from "picklefinance-core";
import { FC, HTMLAttributes } from "react";
import { classNames, formatDate, formatDollars, weiToVisibleString } from "v2/utils";
import Link from "v2/components/Link";
import {
  PnlTransactionWrapper,
  StakingRewards,
  UserTransfer,
  UserTx,
} from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";
import { t } from "xstate";
import { BigNumber } from "ethers";

const TxTableRowHeader: FC<{
  wallet: string;
  tx: PnlTransactionWrapper;
  userPnl: PnlTransactionWrapper[];
  allPnlTx: PnlTransactionWrapper[];
  txSort: "old" | "new";
  core: PickleModelJson.PickleModelJson;
  open: boolean;
}> = ({ wallet, tx, userPnl, allPnlTx, txSort, core, open }) => {
  const chain = core.chains.find((c) => c.chainId == tx.userTransaction.chain_id);
  const txLinkUrl = `${chain?.explorer}/tx/${tx.userTransaction.hash}`;
  return (
    <>
      <RowCell className={classNames(!open && "rounded-bl-xl", "rounded-tl-xl flex items-center")}>
        <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
          {formatDate(new Date(tx.userTransaction.timestamp * 1000))}
        </p>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
              {txTypeDbToString(tx.userTransaction.transaction_type)}
            </p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <Link href={txLinkUrl} external primary className="font-bold ml-1">
          {tx.userTransaction.hash.slice(0, 5) + "..." + tx.userTransaction.hash.slice(-3)}
        </Link>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
              {userTxToPtokenCount(tx.userTransaction, wallet)}
            </p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
            {rollingBalances(userPnl, tx)}
            </p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
              {userTxToValue(tx.userTransaction, wallet)}
            </p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
              {Object.keys(tx.transactionRewards).length > 0
                ? rewardsArrToValue(tx.transactionRewards)
                : "--"}
            </p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
          {txSort === "old" ? txToPnl(tx, allPnlTx.slice(-1)[0]) : txToPnl(tx, allPnlTx[0])}
        </p>
      </RowCell>
      <RowCell className={classNames(!open && "rounded-br-xl", "rounded-tr-xl w-10")}>
        <div className="flex justify-end pr-3">
          <ChevronDownIcon
            className={classNames(
              open && "rotate-180",
              "text-foreground ml-2 h-5 w-5 transition duration-300 ease-in-out",
            )}
            aria-hidden="true"
          />
        </div>
      </RowCell>
    </>
  );
};

const RowCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-background-light p-4 whitespace-nowrap text-sm text-foreground sm:p-6 group-hover:bg-background-lightest transition duration-300 ease-in-out",
      className,
    )}
  >
    {children}
  </td>
);

const rewardsArrToValue = (rewards: StakingRewards) => {
  let totalRewardValue = 0;
  Object.keys(rewards).forEach((token) => {
    rewards[token].forEach((r) => (totalRewardValue += r.value));
  });
  if (totalRewardValue < 0.01) return "< $0.00";
  return formatDollars(totalRewardValue, 2);
};

const txToPnl = (tx: PnlTransactionWrapper, lastTx: PnlTransactionWrapper) => {
  if (!["ZAPIN", "DEPOSIT", "AIRDROP"].includes(tx.userTransaction.transaction_type)) return "N/A";
  const index = tx.pnlRollingDataWithLots.lots.length - 1;
  const thisTxInFuture = lastTx.pnlRollingDataWithLots.lots[index];
  const fractionOpen = thisTxInFuture.weiRemaining.mul(1000).div(thisTxInFuture.wei).toNumber() / 1000;
  const fractionClosed = 1 - fractionOpen;
  if( fractionClosed === 0 ) {
    return "OPEN";
  }
  const pnl = thisTxInFuture.saleProceedsUSD - (fractionClosed * thisTxInFuture.totalCostUsd);
  const ret = formatDollars(pnl, 2);
  if( fractionClosed > 0 && fractionClosed < 1) {
    return ret + " (PARTIAL)";
  }
  return ret;
};

const userTxToValue = (tx: UserTx, wallet: string) => {
  let userTransfer: UserTransfer | undefined = findMainTransfer(tx, wallet);
  if( !userTransfer ) {
    return "$0.00";
  }
  return formatDollars(userTransfer.value, 2);
};

const findAllMainTransfers = (tx: UserTx): UserTransfer | undefined => {
  let test: UserTransfer | undefined = undefined;
  if (tx.transaction_type === "DEPOSIT" || tx.transaction_type === "ZAPIN")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "DEPOSIT") test = t;
    });
  if (tx.transaction_type === "WITHDRAW" || tx.transaction_type === "ZAPOUT")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "WITHDRAW") test = t;
    });
  if (tx.transaction_type === "STAKE")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "STAKE") test = t;
    });
  if (tx.transaction_type === "UNSTAKE")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "UNSTAKE") test = t;
    });
  return test;
}

const findMainTransfer = (tx: UserTx, wallet: string): UserTransfer | undefined => {
  let test: UserTransfer | undefined = undefined;
  if (tx.transaction_type === "DEPOSIT" || tx.transaction_type === "ZAPIN")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "DEPOSIT") test = t;
    });
  if (tx.transaction_type === "WITHDRAW" || tx.transaction_type === "ZAPOUT")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "WITHDRAW") test = t;
    });
  if (tx.transaction_type === "STAKE")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "STAKE") test = t;
    });
  if (tx.transaction_type === "UNSTAKE")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "UNSTAKE") test = t;
    });
  if (tx.transaction_type === "AIRDROP") {
    if( wallet && wallet.length > 0 ) {
      const transfers = tx.transfers.filter((x) => x.toAddress.toLowerCase() === wallet.toLowerCase());
      if( transfers && transfers.length > 0 ) {
        test = transfers[0];
      }
    }
  }
  return test;
}
const userTxToPtokenCount = (tx: UserTx, wallet: string) => {
  let userTransfer: UserTransfer | undefined = findMainTransfer(tx, wallet);
  if( !userTransfer ) {
    return "0";
  }
  const value = userTransfer ? userTransfer.amount : "0";
  return weiToVisibleString(value, userTransfer.decimals);
}

const txTypeDbToString = (dbVal: string): string => {
  if( txTypeOverrides[dbVal] ) {
    return txTypeOverrides[dbVal];
  }
  const arr: string[] = dbVal.split("_").map((x) => x.toLowerCase()).map(
    (x) => x.length === 0 ? "" : x[0].toUpperCase() + (x.length === 1 ? "" : x.substring(1)));
  return arr.join(" ");
}

const txTypeOverrides: { [key: string]: string } = {
  ZAPIN: "Zap In",
  ZAPOUT: "Zap Out",
  MIGRATIO: "Migration",
};

const findDepositTokenDecimalCount = (userPnl: PnlTransactionWrapper[]) => {
  for( let i = 0; i < userPnl.length; i++ ) {
    if (userPnl[i].userTransaction.transaction_type === "DEPOSIT" || userPnl[i].userTransaction.transaction_type === "ZAPIN") {
      const transfers = userPnl[i].userTransaction.transfers;
      for( let j = 0; j < transfers.length; j++ ) {
        if (transfers[j].transfer_type === "DEPOSIT") 
          return transfers[j].decimals;
      }
    }
  };
  return 18;
}
const rollingBalances = (userPnl: PnlTransactionWrapper[], tx: PnlTransactionWrapper) => {
  const weiBalance = tx.pnlRollingDataWithLots.rollingWeiCount.toString();
  let dec: number = findDepositTokenDecimalCount(userPnl);

  let locked: BigNumber = BigNumber.from(0);
  let remaining: BigNumber = BigNumber.from(0);
  for( let i = 0; i < tx.pnlRollingDataWithLots.lots.length; i++ ) {
    locked = locked.add(tx.pnlRollingDataWithLots.lots[i].weiLocked);
    remaining = remaining.add(tx.pnlRollingDataWithLots.lots[i].weiRemaining);
  }
  const unlocked = remaining.sub(locked);
  const unlockedStr = weiToVisibleString(unlocked.toString(), dec);
  const lockedStr = weiToVisibleString(locked.toString(), dec);
  return unlockedStr + " / " + lockedStr;
}

export default TxTableRowHeader;
