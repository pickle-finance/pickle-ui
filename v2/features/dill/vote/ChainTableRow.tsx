import { FC, HTMLAttributes } from "react";
import { PickleModelJson } from "picklefinance-core";
import { AssetEnablement, JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { RawChain } from "picklefinance-core/lib/chain/Chains";
import { ChainVote, iOffchainVoteData, UserVote } from "v2/store/offchainVotes";
import { classNames, formatPercentage } from "v2/utils";
import TableSpacerRow from "./TableSpacerRow";

export const ChainTableRow: FC<{
  network: string;
  core: PickleModelJson.PickleModelJson | undefined;
  offchainVoteData: iOffchainVoteData | undefined;
  wallet: string | undefined | null;
  setChange: (e: any) => void;
}> = ({ network, core, offchainVoteData, wallet, setChange }) => {
  const chainData: RawChain = core
    ? core.chains.filter((x) => x.network === network)[0]
    : ({} as RawChain);
  const chainJars: JarDefinition[] = core
    ? core.assets.jars.filter(
        (jar) =>
          jar.chain === chainData.network &&
          jar.enablement !== AssetEnablement.PERMANENTLY_DISABLED,
      )
    : [];
  const blendedApr = getBlendedApr(chainJars);

  return (
    <>
      <tr className="group">
        <ChainTableCell className="rounded-l-xl">
          <ChainTableP text={chainData.networkVisible} className="text-left" />
        </ChainTableCell>

        <ChainTableCell>
          <ChainTableP text={blendedApr} />
        </ChainTableCell>

        <ChainTableCell>
          <ChainTableP text={getPlatformWeight(chainData.network, offchainVoteData)} />
        </ChainTableCell>

        <ChainTableCell>
          <ChainTableP text={getUserWeight(chainData.network, offchainVoteData, wallet)} />
        </ChainTableCell>

        <ChainTableCell className="rounded-r-xl">
          <ChainTableCellInput
            chain={network}
            val={getUserWeight(chainData.network, offchainVoteData, wallet)}
            setChange={setChange}
          />
        </ChainTableCell>
      </tr>
      <TableSpacerRow />
    </>
  );
};

const ChainTableCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-background-light p-4 whitespace-nowrap text-sm text-foreground text-center sm:p-6 group-hover:bg-background-lightest",
      className,
    )}
  >
    {children}
  </td>
);

const ChainTableCellInput: FC<{ chain: string; val: string; setChange: (e: any) => void }> = ({
  chain,
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
      id={chain}
    />
    <span className="text-foreground-alt-200"> %</span>
  </>
);

const ChainTableP: FC<{ text: string; className?: string }> = ({ text, className }) => (
  <p className={classNames("font-title font-medium text-base leading-5", className)}>{text}</p>
);

const getBlendedApr = (chainJars: JarDefinition[]) => {
  let tvl = 0;
  let blendedRateSum = 0;
  for (let i = 0; i < chainJars.length; i++) {
    if (chainJars[i].details?.harvestStats?.balanceUSD) {
      const jarApr = chainJars[i].aprStats?.apr ? chainJars[i].aprStats?.apr : 0;
      const bal = chainJars[i].details?.harvestStats?.balanceUSD
        ? chainJars[i].details?.harvestStats?.balanceUSD
        : 0;
      tvl += bal ? bal : 0;
      blendedRateSum += bal && jarApr ? bal * jarApr : 0;
    }
  }
  return (blendedRateSum / tvl).toFixed(3) + " %";
};

const getPlatformWeight = (
  currentChain: string,
  offchainVoteData: iOffchainVoteData | undefined,
): string => {
  const thisChainVote: ChainVote | undefined = offchainVoteData?.chains.find(
    (c) => c.chain === currentChain,
  );
  return thisChainVote ? formatPercentage(thisChainVote?.adjustedChainWeight * 100) : "-";
};

const getUserWeight = (
  currentChain: string,
  offchainVoteData: iOffchainVoteData | undefined,
  wallet: string | undefined | null,
): string => {
  const thisUserVotes: UserVote | undefined = offchainVoteData?.votes.find(
    (v) => v.wallet.toLowerCase() === wallet?.toLowerCase(),
  );
  const thisChainUserVote = thisUserVotes?.chainWeights?.find((c) => c.chain === currentChain);
  return thisChainUserVote ? thisChainUserVote.weight.toString() + "%" : "0%";
};
