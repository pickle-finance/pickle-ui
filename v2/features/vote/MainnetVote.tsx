import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useTranslation } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { FC, useEffect, useState } from "react";
import castVoteMainnet from "./CastVoteMainnet";
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
  const [change, setChange] = useState(null);
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    const userJars = getUserJars(user, core);
    setSelectedJars(userJars);
  }, [user, core]);

  useEffect(() => {
    if (change) {
      if (sumVotes(selectedJars) !== 100) setEnabled(false);
      else setEnabled(true);
    }
  }, [change]);

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2 mb-5 mt-10">
        {t("v2.dill.vote.subtitleMainnet")}
      </h1>
      <p className="flex py-2 text-foreground-alt-200 justify-between mb-5">
        <span className="font-medium text-base indent-4">
          {t("v2.dill.vote.descriptionMainnet")}
        </span>
      </p>
      <JarSelect
        core={core}
        mainnet={true}
        selectedJars={selectedJars}
        setSelectedJars={setSelectedJars}
      />
      {selectedJars.length > 0 && (
        <JarTable
          selectedJars={selectedJars}
          core={core}
          mainnet={true}
          user={user}
          setChange={setChange}
        />
      )}
      <MainnetVoteButton
        vote={castVoteMainnet}
        provider={library}
        selectedJars={selectedJars}
        core={core}
        enabled={enabled}
      />
    </>
  );
};

const getUserJars = (user: UserData | undefined, core: PickleModelJson.PickleModelJson) => {
  const tokens = user ? user.votes.map((v) => v.farmDepositToken) : [];
  const jarNames: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    for (let j = 0; j < core.assets.jars.length; j++) {
      let thisJar = core.assets.jars[j];
      let contract = thisJar.contract;
      if (contract?.toLowerCase() === token.toLowerCase()) jarNames.push(thisJar.details.apiKey);
    }
  }
  return jarNames;
};

const sumVotes = (selected: string[]): number => {
  let sum = 0;
  selected.forEach((s) => {
    const inputElement = document.getElementById(s) as HTMLInputElement;
    if (+inputElement.value < 0) sum += +inputElement.value * -1;
    else sum += +inputElement.value;
  });
  return sum;
};

export default MainnetVote;
