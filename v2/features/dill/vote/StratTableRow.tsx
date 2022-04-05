import { FC, HTMLAttributes } from "react";
import { iOffchainVoteData, UserVote } from "v2/store/offchainVotes";
import { classNames } from "v2/utils";
import TableSpacerRow from "./TableSpacerRow";

const StratTableRow: FC<{
  strat: keyof iStrategyTranslation;
  offchainVoteData: iOffchainVoteData | undefined;
  wallet: string | undefined | null;
}> = ({ strat, offchainVoteData, wallet }) => {
  const strategyName = strategyTranslation[strat];

  return (
    <>
      <tr className="group">
        <StratTableCell className="rounded-l-xl">
          <StratTableP text={strategyName} className="text-left" />
        </StratTableCell>
        <StratTableCell>
          <StratTableP text={getUserWeight(strat, offchainVoteData, wallet)} />
        </StratTableCell>
        <StratTableCell className="rounded-r-xl">
          <StratTableInput strat={strat} val={getUserWeight(strat, offchainVoteData, wallet)} />
        </StratTableCell>
      </tr>
      <TableSpacerRow />
    </>
  );
};

const StratTableCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-background-light p-4 whitespace-nowrap text-sm text-foreground text-center sm:p-6 group-hover:bg-background-lightest",
      className,
    )}
  >
    {children}
  </td>
);

const StratTableP: FC<{ text: string; className?: string }> = ({ text, className }) => (
  <p className={classNames("font-title font-medium text-base leading-5", className)}>{text}</p>
);

const StratTableInput: FC<{ strat: string; val: string }> = ({ strat, val }) => (
  <>
    <input
      className="bg-background border border-foreground-alt-400 rounded p-2 text-center text-foreground-alt-200 focus:outline-none"
      type="number"
      min="-100"
      max="100"
      defaultValue={val.slice(0, val.length - 1)}
      id={strat}
    />
    <span className="text-foreground-alt-200"> %</span>
  </>
);

const getUserWeight = (
  strategyName: string,
  offchainVoteData: iOffchainVoteData | undefined,
  wallet: string | undefined | null,
): string => {
  const thisUserVotes: UserVote | undefined = offchainVoteData?.votes.find(
    (v) => v.wallet.toLowerCase() === wallet?.toLowerCase(),
  );
  const thisStratUserVote = thisUserVotes?.jarWeights?.find(
    (j) => j.jarKey.toLowerCase() === strategyName.toLowerCase(),
  );
  return thisStratUserVote ? thisStratUserVote.weight.toString() + "%" : "0%";
};

const strategyTranslation = {
  "strategy.delegate.team": "Delegate to the Team",
  "strategy.tvl": "Vote by TVL",
  "strategy.profit": "Vote by Profit",
};

export interface iStrategyTranslation {
  "strategy.delegate.team": string;
  "strategy.tvl": string;
  "strategy.profit": string;
}

export default StratTableRow;
