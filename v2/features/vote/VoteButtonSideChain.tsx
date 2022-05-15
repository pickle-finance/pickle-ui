import { Web3Provider } from "@ethersproject/providers";
import { useTranslation } from "next-i18next";
import { FC } from "react";
import Button from "v2/components/Button";

const OffchainVoteButton: FC<{
  vote: voteFunction;
  enabled: boolean;
  provider: Web3Provider | undefined;
  account: string | null | undefined;
  selectedChainStrats: string[];
  selectedChains: string[];
  selectedJarStrats: string[];
  selectedJars: string[];
}> = ({
  vote,
  enabled,
  provider,
  account,
  selectedChainStrats,
  selectedChains,
  selectedJarStrats,
  selectedJars,
}) => {
  const { t } = useTranslation("common");
  const enablement = enabled ? "enabled" : "disabled";

  return (
    <div className="grid grid-cols-1 place-items-end mt-5 mb-5 pb-10">
      <Button
        size="small"
        state={enablement}
        onClick={() =>
          vote(
            provider,
            account,
            selectedChainStrats,
            selectedChains,
            selectedJarStrats,
            selectedJars,
          )
        }
      >
        {t("v2.dill.vote.castOffchainVote")}
      </Button>
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
