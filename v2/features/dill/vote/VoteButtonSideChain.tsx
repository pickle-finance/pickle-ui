import { Web3Provider } from "@ethersproject/providers";
import { useTranslation } from "next-i18next";
import { FC } from "react";

const OffchainVoteButton: FC<{
  vote: voteFunction;
  provider: Web3Provider | undefined;
  account: string | null | undefined;
  selectedChainStrats: string[];
  selectedChains: string[];
  selectedJarStrats: string[];
  selectedJars: string[];
}> = ({ vote, provider, account, selectedChainStrats, selectedChains, selectedJarStrats, selectedJars }) => {
  const { t } = useTranslation("common");
  return (
    <div className="pb-10 mb-5 mt-10">
      <button
        className="float-right rounded p-2 border border-foreground-alt-400 bg-background text-foreground-alt-200"
        onClick={() => vote(provider, account, selectedChainStrats, selectedChains, selectedJarStrats, selectedJars)}
      >
        {t("v2.dill.vote.castOffchainVote")}
      </button>
    </div>
  );
};

export type voteFunction = (
  provider: Web3Provider | undefined,
  account: string | null | undefined,
  selectedChainStrats: string[],
  selectedChain: string[],
  selectedJarStrats: string[],
  selectedJars: string[],
) => void;

export default OffchainVoteButton;
