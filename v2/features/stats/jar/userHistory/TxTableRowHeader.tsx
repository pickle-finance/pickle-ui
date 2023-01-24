import { ChevronDownIcon } from "@heroicons/react/solid";
import { PickleModelJson } from "picklefinance-core";
import { FC, HTMLAttributes } from "react";
import { classNames, formatDate, formatDollars } from "v2/utils";
import Link from "v2/components/Link";
import {
  PnlTransactionWrapper,
  StakingRewards,
  UserTx,
} from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";

const TxTableRowHeader: FC<{
  tx: PnlTransactionWrapper;
  userPnl: PnlTransactionWrapper[];
  txSort: "old" | "new";
  core: PickleModelJson.PickleModelJson;
  open: boolean;
}> = ({ tx, userPnl, txSort, core, open }) => {
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
              {txType[tx.userTransaction.transaction_type]}
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
              {"tmp 1"}
            </p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
              {"tmp 2"}
            </p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5 text-foreground-alt-200">
              {userTxToValue(tx.userTransaction)}
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
          {txSort === "old" ? txToPnl(tx, userPnl.slice(-1)[0]) : txToPnl(tx, userPnl[0])}
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
  if (!["ZAPIN", "DEPOSIT"].includes(tx.userTransaction.transaction_type)) return "N/A";
  const index = tx.pnlRollingDataWithLots.lots.length - 1;
  const thisTxInFuture = lastTx.pnlRollingDataWithLots.lots[index];
  const pnl = thisTxInFuture.saleProceedsUSD - thisTxInFuture.totalCostUsd;
  return formatDollars(pnl, 2);
};

// TODO remove this function once logic is included in core
const userTxToValue = (tx: UserTx) => {
  let value = "$0";
  if (tx.transaction_type === "DEPOSIT" || tx.transaction_type === "ZAPIN")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "WANT_DEPOSIT") value = formatDollars(t.value, 2);
    });
  if (tx.transaction_type === "WITHDRAW" || tx.transaction_type === "ZAPOUT")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "WANT_WITHDRAW") value = formatDollars(t.value, 2);
    });
  if (tx.transaction_type === "STAKE")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "STAKE") value = formatDollars(t.value, 2);
    });
  if (tx.transaction_type === "UNSTAKE")
    tx.transfers.forEach((t) => {
      if (t.transfer_type === "UNSTAKE") value = formatDollars(t.value, 2);
    });
  return value;
};

const txType: { [key: string]: string } = {
  DEPOSIT: "Deposit",
  STAKE: "Stake",
  UNSTAKE: "Unstake",
  WITHDRAW: "Withdraw",
  ZAPIN: "Zap In",
  STAKE_REWARD: "Stake Reward",
};

export default TxTableRowHeader;
