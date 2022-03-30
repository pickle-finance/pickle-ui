import { Web3Provider } from "@ethersproject/providers";
import { useTranslation } from "next-i18next";
import { FC } from "react";

export const VoteButton: FC<{
  vote: voteFunction, 
  provider: Web3Provider | undefined,
  account: string | null | undefined,
  selectedJars: string[]
}> = ({vote, provider, account, selectedJars}) => {
  const { t } = useTranslation("common");
  return (
    <div className="pb-10">
      <button className="float-right rounded p-2 border border-foreground-alt-400 bg-background text-foreground-alt-200"
        onClick={() => vote(provider, account, selectedJars)}
      >
        {t("v2.dill.vote.castVote")}
      </button>
    </div>
  )
}

export type voteFunction = (
  provider: Web3Provider | undefined,
  account: string | null | undefined,
  selectedJars: string[],
) => void;