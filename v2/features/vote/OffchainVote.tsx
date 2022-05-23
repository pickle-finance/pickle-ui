import { FC, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useTranslation } from "next-i18next";
import { iOffchainVoteData, UserVote } from "v2/store/offchainVotes";
import { PickleModelJson } from "picklefinance-core";

import ChainSelect from "./ChainSelect";
import ChainTable from "./ChainTable";
import JarSelect from "./JarSelect";
import JarTable from "./JarTable";
import StratTable from "./StratTable";
import OffchainVoteButton from "./VoteButtonSideChain";
import castVoteSideChain from "./CastVoteSideChain";

const OffchainVote: FC<{
  offchainVoteData: iOffchainVoteData | undefined;
  core: PickleModelJson.PickleModelJson;
}> = ({ offchainVoteData, core }) => {
  const { account, library } = useWeb3React<Web3Provider>();
  const { t } = useTranslation("common");

  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedChainStrats, setSelectecChainStrats] = useState<string[]>([]);
  const [selectedSidechainJars, setSelectedSidechainJars] = useState<string[]>([]);
  const [selectedJarStrats, setSelectedJarStrats] = useState<string[]>([]);

  const [change, setChange] = useState(null);
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    const userChains = getUserChainsOrStrats(offchainVoteData, account);
    const userJars = getUserJarsOrStrats(offchainVoteData, account);

    setSelectecChainStrats(userChains.stratNames);
    setSelectedChains(userChains.chainNames);
    setSelectedJarStrats(userJars.stratNames);
    setSelectedSidechainJars(userJars.jarNames);
  }, [offchainVoteData, account]);

  useEffect(() => {
    if (change) {
      if (
        sumVotes(selectedJarStrats, selectedSidechainJars) !== 100 ||
        sumVotes(selectedChainStrats, selectedChains) !== 100
      )
        setEnabled(false);
      else setEnabled(true);
    }
  }, [change]);

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2 mb-5 mt-10">
        {t("v2.dill.vote.subtitleOffchain")}
      </h1>
      <p className="flex py-2 text-foreground-alt-200 justify-between mb-5">
        <span className="font-medium text-base indent-4">
          {t("v2.dill.vote.descriptionOffchain")}
        </span>
      </p>
      <ChainSelect
        core={core}
        selectedChains={selectedChains}
        selectedChainStrats={selectedChainStrats}
        setSelectedChains={setSelectedChains}
        setSelectedChainStrats={setSelectecChainStrats}
      />
      <div>
        <div className="mt-10 mb-10 pr-5 pl-5 border border-foreground-alt-500 rounded">
          {selectedChainStrats.length > 0 && (
            <StratTable
              selectedStrats={selectedChainStrats}
              offchainVoteData={offchainVoteData}
              wallet={account}
              setChange={setChange}
            />
          )}
          {selectedChains.length > 0 && (
            <ChainTable
              selectedChains={selectedChains}
              core={core}
              offchainVoteData={offchainVoteData}
              wallet={account}
              setChange={setChange}
            />
          )}
        </div>
        <JarSelect
          core={core}
          mainnet={false}
          selectedJarStrats={selectedJarStrats}
          selectedJars={selectedSidechainJars}
          setSelectedJarStrats={setSelectedJarStrats}
          setSelectedJars={setSelectedSidechainJars}
        />
        <div className="mt-10 pr-5 pl-5 border border-foreground-alt-500 rounded">
          {selectedJarStrats.length > 0 && (
            <StratTable
              selectedStrats={selectedJarStrats}
              offchainVoteData={offchainVoteData}
              wallet={account}
              setChange={setChange}
            />
          )}
          {selectedSidechainJars.length > 0 && (
            <JarTable
              selectedJars={selectedSidechainJars}
              core={core}
              mainnet={false}
              offchainVoteData={offchainVoteData}
              wallet={account}
              setChange={setChange}
            />
          )}
        </div>
        <OffchainVoteButton
          vote={castVoteSideChain}
          enabled={enabled}
          provider={library}
          account={account}
          selectedChainStrats={selectedChainStrats}
          selectedChains={selectedChains}
          selectedJarStrats={selectedJarStrats}
          selectedJars={selectedSidechainJars}
        />
      </div>
    </>
  );
};

const getUserChainsOrStrats = (
  offchainVoteData: iOffchainVoteData | undefined,
  account: string | undefined | null,
) => {
  const nullVote = {} as UserVote;
  const strategies = ["strategy.chain.sidechains.equal", "strategy.chain.delegate.team"];
  const userVotes =
    offchainVoteData && account
      ? offchainVoteData.votes.find((v) => v.wallet.toLowerCase() === account.toLowerCase()) ||
        nullVote
      : nullVote;
  const stratNames: string[] = [];
  const chainNames: string[] = [];
  if (userVotes && userVotes.chainWeights)
    for (let i = 0; i < userVotes?.chainWeights?.length; i++) {
      let name = userVotes?.chainWeights[i].chain;
      if (strategies.includes(name)) {
        stratNames.push(name);
      } else chainNames.push(name);
    }
  return { stratNames, chainNames };
};

const getUserJarsOrStrats = (
  offchainVoteData: iOffchainVoteData | undefined,
  account: string | undefined | null,
) => {
  const nullVote = {} as UserVote;
  const strategies = ["strategy.tvl", "strategy.profit", "strategy.delegate.team"];
  const userVotes =
    offchainVoteData && account
      ? offchainVoteData.votes.find((v) => v.wallet.toLowerCase() === account.toLowerCase()) ||
        nullVote
      : nullVote;
  const stratNames: string[] = [];
  const jarNames: string[] = [];
  if (userVotes && userVotes.jarWeights) {
    for (let i = 0; i < userVotes?.jarWeights?.length; i++) {
      let name = userVotes?.jarWeights[i].jarKey;
      if (strategies.includes(name)) stratNames.push(name);
      else jarNames.push(name);
    }
  }
  return { stratNames, jarNames };
};

const sumVotes = (selected: string[], selected2?: string[]): number => {
  let sum = 0;
  selected.forEach((s) => {
    const inputElement = document.getElementById(s) as HTMLInputElement;
    if (+inputElement.value < 0) sum += +inputElement.value * -1;
    else sum += +inputElement.value;
  });
  if (selected2) {
    selected2.forEach((s) => {
      const inputElement = document.getElementById(s) as HTMLInputElement;
      if (+inputElement.value < 0) sum += +inputElement.value * -1;
      else sum += +inputElement.value;
    });
  }
  return sum;
};

export default OffchainVote;
