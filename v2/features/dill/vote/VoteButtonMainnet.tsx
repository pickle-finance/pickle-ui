import { Web3Provider } from "@ethersproject/providers";
import { useTranslation } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { FC } from "react";

const MainnetVoteButton: FC<{
  vote: voteFunction, 
  provider: Web3Provider | undefined,
  selectedJars: string[],
  core: PickleModelJson.PickleModelJson | undefined
}> = ({vote, provider, selectedJars, core}) => {
  const { t } = useTranslation("common");
  return (
    <div className="pb-10">
      <button className="float-right rounded p-2 border border-foreground-alt-400 bg-background text-foreground-alt-200"
        onClick={() => vote(provider, selectedJars, core)}
      >
        {t("v2.dill.vote.castMainnetVote")}
      </button>
    </div>
  )
}

export type voteFunction = (
  provider: Web3Provider | undefined,
  selectedJars: string[],
  core: PickleModelJson.PickleModelJson | undefined
) => void;

export default MainnetVoteButton;