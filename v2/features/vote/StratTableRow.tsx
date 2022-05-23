import { FC, HTMLAttributes } from "react";
import { iChainWeight, iJarWeight, iOffchainVoteData, UserVote } from "v2/store/offchainVotes";
import { classNames } from "v2/utils";
import TableSpacerRow from "./TableSpacerRow";

const StratTableRow: FC<{
  strat: keyof iStrategyTranslation;
  offchainVoteData: iOffchainVoteData | undefined;
  wallet: string | undefined | null;
  setChange: (e: any) => void;
}> = ({ strat, offchainVoteData, wallet, setChange }) => {
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
          <StratTableInput
            strat={strat}
            val={getUserWeight(strat, offchainVoteData, wallet)}
            setChange={setChange}
          />
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

const StratTableInput: FC<{ strat: string; val: string; setChange: (e: any) => void }> = ({
  strat,
  val,
  setChange,
}) => (
  <>
    <input
      className="bg-background border border-foreground-alt-400 rounded p-2 text-center text-foreground-alt-200 focus:outline-none"
      type="number"
      min="-100"
      max="100"
      defaultValue={val.slice(0, val.length - 1)}
      onInput={(e) => setChange(e)}
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
  let thisStratUserVote: iJarWeight | iChainWeight | undefined = thisUserVotes?.jarWeights?.find(
    (j) => j.jarKey.toLowerCase() === strategyName.toLowerCase(),
  );
  if (!thisStratUserVote)
    thisStratUserVote = thisUserVotes?.chainWeights?.find(
      (c) => c.chain.toLowerCase() === strategyName.toLowerCase(),
    );
  return thisStratUserVote ? thisStratUserVote.weight.toString() + "%" : "0%";
};

const strategyTranslation = {
  "strategy.chain.delegate.team": "Delegate to the Team",
  "strategy.chain.sidechains.equal": "Distribute Equally to Sidechains",
  "strategy.delegate.team": "Delegate to the Team",
  "strategy.tvl": "Vote by TVL",
  "strategy.profit": "Vote by Profit",
};

export interface iStrategyTranslation {
  "strategy.chain.delegate.team": string;
  "strategy.chain.sidechains.equal": string;
  "strategy.delegate.team": string;
  "strategy.tvl": string;
  "strategy.profit": string;
}

export default StratTableRow;
