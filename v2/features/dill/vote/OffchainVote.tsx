import { FC, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useTranslation } from "next-i18next";
import { iOffchainVoteData, UserVote } from "v2/store/offchainVotes";
import { PickleModelJson } from "picklefinance-core";

import ChainSelect from "./ChainSelect";
import ChainTable from "./ChainTable";
import ChartContainer from "./ChartContainer";
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

  const [selectedChains, setSelectedChains] = useState<string[]>(
    getUserChainsOrStrats(offchainVoteData, account).chainNames
  );
  const [selectedChainStrats, setSelectecChainStrats] = useState<string[]>(
    getUserChainsOrStrats(offchainVoteData, account).stratNames
  )
  const [selectedSidechainJars, setSelectedSidechainJars] = useState<string[]>(
    getUserJarsOrStrats(offchainVoteData, account).jarNames,
  );
  const [selectedJarStrategies, setSelectedJarStrategies] = useState<string[]>(
    getUserJarsOrStrats(offchainVoteData, account).stratNames,
  );

  return (
    <>
      <h1 className="mb-5">{t("v2.dill.vote.subtitleOffchain")}</h1>
      <div className="w-full inline-grid grid-cols-2 gap-4">
        <ChartContainer
          platformOrUser="platform"
          mainnet={false}
          offchainVoteData={offchainVoteData}
        />
        <ChartContainer
          platformOrUser="user"
          mainnet={false}
          offchainVoteData={offchainVoteData}
          wallet={account}
        />
      </div>
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
            />
          )}
          {selectedChains.length > 0 && (
            <ChainTable
              selectedChains={selectedChains}
              core={core}
              offchainVoteData={offchainVoteData}
              wallet={account}
            />
          )}
        </div>
        <JarSelect
          core={core}
          mainnet={false}
          selectedJarStrats={selectedJarStrategies}
          selectedJars={selectedSidechainJars}
          setSelectedJars={setSelectedSidechainJars}
          setSelectedJarStrategies={setSelectedJarStrategies}
        />
        <div className="mt-10 pr-5 pl-5 border border-foreground-alt-500 rounded">
          {selectedJarStrategies.length > 0 && (
            <StratTable
              selectedStrats={selectedJarStrategies}
              offchainVoteData={offchainVoteData}
              wallet={account}
            />
          )}
          {selectedSidechainJars.length > 0 && (
            <JarTable
              selectedJars={selectedSidechainJars}
              core={core}
              mainnet={false}
              offchainVoteData={offchainVoteData}
              wallet={account}
            />
          )}
        </div>
        <OffchainVoteButton
          vote={castVoteSideChain}
          provider={library}
          account={account}
          selectedChains={selectedChains}
          selectedJars={selectedSidechainJars}
          selectedStrats={selectedJarStrategies}
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
      let name = userVotes?.chainWeights[i].chain
      if (strategies.includes(name)) stratNames.push();
      chainNames.push(name)
    }
  return {stratNames, chainNames};
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
      jarNames.push(name);
    }
  }
  return { stratNames, jarNames };
};

export default OffchainVote;
