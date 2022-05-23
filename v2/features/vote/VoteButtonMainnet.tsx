import { Web3Provider } from "@ethersproject/providers";
import { useTranslation } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { FC } from "react";
import Button from "v2/components/Button";

const MainnetVoteButton: FC<{
  vote: voteFunction;
  provider: Web3Provider | undefined;
  selectedJars: string[];
  core: PickleModelJson.PickleModelJson | undefined;
  enabled: boolean;
}> = ({ vote, provider, selectedJars, core, enabled }) => {
  const { t } = useTranslation("common");
  const enablement = enabled ? "enabled" : "disabled";

  return (
    <div className="grid grid-cols-1 place-items-end mt-5 pb-10">
      <Button state={enablement} size="small" onClick={() => vote(provider, selectedJars, core)}>
        {t("v2.dill.vote.castMainnetVote")}
      </Button>
    </div>
  );
};

export type voteFunction = (
  provider: Web3Provider | undefined,
  selectedJars: string[],
  core: PickleModelJson.PickleModelJson | undefined,
) => void;

export default MainnetVoteButton;
