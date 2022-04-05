import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useTranslation } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { FC, useState } from "react";
import castVoteMainnet from "./CastVoteMainnet";
import ChartContainer from "./ChartContainer";
import JarSelect from "./JarSelect";
import JarTable from "./JarTable";
import MainnetVoteButton from "./VoteButtonMainnet";

const MainnetVote: FC<{ core: PickleModelJson.PickleModelJson; user: UserData | undefined }> = ({
  core,
  user,
}) => {
  const { library } = useWeb3React<Web3Provider>();
  const { t } = useTranslation("common");

  const [selectedJars, setSelectedJars] = useState<string[]>([]);

  return (
    <>
      <h1 className="mb-5">{t("v2.dill.vote.subtitleMainnet")}</h1>
      <div className="w-full inline-grid grid-cols-2 gap-4">
        <ChartContainer platformOrUser="platform" mainnet={true} core={core} />
        <ChartContainer platformOrUser="user" mainnet={true} core={core} user={user} />
      </div>
      <JarSelect core={core} mainnet={true} setSelectedJars={setSelectedJars} />
      {selectedJars.length > 0 && (
        <div>
          <JarTable selectedJars={selectedJars} core={core} mainnet={true} user={user} />
          <MainnetVoteButton
            vote={castVoteMainnet}
            provider={library}
            selectedJars={selectedJars}
            core={core}
          />
        </div>
      )}
    </>
  );
};

export default MainnetVote;
