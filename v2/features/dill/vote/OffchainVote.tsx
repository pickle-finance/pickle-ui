import { FC, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
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
import { useTranslation } from "next-i18next";

const OffchainVote: FC<{
  offchainVoteData: iOffchainVoteData | undefined;
  core: PickleModelJson.PickleModelJson;
}> = ({ offchainVoteData, core }) => {
  const { account, library } = useWeb3React<Web3Provider>();
  const { t } = useTranslation("common");

  const [selectedChains, setSelectedChains] = useState<string[]>(
    getUserChains(offchainVoteData, account),
  );
  const [selectedSidechainJars, setSelectedSidechainJars] = useState<string[]>(
    getUserJarsOrStrats(offchainVoteData, account).jarNames,
  );
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>(
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
      <ChainSelect core={core} selectedChains={selectedChains} setSelectedChains={setSelectedChains} />
      <JarSelect
        core={core}
        mainnet={false}
        selectedStrats={selectedStrategies}
        selectedJars={selectedSidechainJars}
        setSelectedJars={setSelectedSidechainJars}
        setSelectedStrategies={setSelectedStrategies}
      />
      <div>
        {selectedChains.length > 0 && (
          <ChainTable
            selectedChains={selectedChains}
            core={core}
            offchainVoteData={offchainVoteData}
            wallet={account}
          />
        )}
        <div className="mt-10 pr-5 pl-5 border border-foreground-alt-500 rounded">
          {selectedStrategies.length > 0 && (
            <StratTable
              selectedStrats={selectedStrategies}
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
        {selectedChains.length > 0 &&
          (selectedStrategies.length > 0 || selectedSidechainJars.length > 0) && (
            <OffchainVoteButton
              vote={castVoteSideChain}
              provider={library}
              account={account}
              selectedChains={selectedChains}
              selectedJars={selectedSidechainJars}
              selectedStrats={selectedStrategies}
            />
          )}
      </div>
    </>
  );
};

const getUserChains = (
  offchainVoteData: iOffchainVoteData | undefined,
  account: string | undefined | null,
) => {
  const nullVote = {} as UserVote;
  console.log(offchainVoteData)
  console.log(account)
  const userVotes = offchainVoteData && account
    ? offchainVoteData.votes.find((v) => v.wallet.toLowerCase() === account.toLowerCase()) || nullVote
    : nullVote;
  console.log(userVotes)
  const chainNames = [];
  if (userVotes && userVotes.chainWeights)
    for (let i = 0; i < userVotes?.chainWeights?.length; i++)
      chainNames.push(userVotes?.chainWeights[i].chain);
  return chainNames;
};

const getUserJarsOrStrats = (
  offchainVoteData: iOffchainVoteData | undefined,
  account: string | undefined | null,
) => {
  const nullVote = {} as UserVote;
  const strategies = ["strategy.tvl", "strategy.profit", "strategy.delegate.team"];
  const userVotes = offchainVoteData && account
    ? offchainVoteData.votes.find((v) => v.wallet.toLowerCase() === account.toLowerCase()) || nullVote
    : nullVote;
  const stratNames: string[] = [];
  const jarNames: string[] = [];
  if (userVotes && userVotes.jarWeights) {
    for (let i = 0; i < userVotes?.jarWeights?.length; i++) {
      let name = userVotes?.jarWeights[i].jarKey;
      if (strategies.includes(name)) stratNames.push(name);
      else jarNames.push(name);
    }
    console.log({stratNames, jarNames});
  }
  return { stratNames, jarNames };
};

export default OffchainVote;
