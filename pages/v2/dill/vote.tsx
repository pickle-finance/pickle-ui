import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";
import type { PickleFinancePage } from "v2/types";
import { CoreSelectors } from "v2/store/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { iOffchainVoteData, VoteSelectors } from "v2/store/offchainVotes";
import { UserSelectors } from "v2/store/user";

import PickleToastContainer from "v2/components/PickleToastContainer";
import LoadingIndicator from "v2/components/LoadingIndicator";
import ChainSelect from "v2/features/dill/vote/ChainSelect";
import JarSelect from "v2/features/dill/vote/JarSelect";
import castVoteMainnet from "v2/features/dill/vote/CastVoteMainnet";
import castVoteSideChain from "v2/features/dill/vote/CastVoteSideChain";
import MainnetVoteButton from "v2/features/dill/vote/VoteButtonMainnet";
import OffchainVoteButton from "v2/features/dill/vote/VoteButtonSideChain";

import JarTable from "v2/features/dill/vote/JarTable";
import { ChainTable } from "v2/features/dill/vote/ChainTable";

const Vote: PickleFinancePage = () => {
  const core = useSelector(CoreSelectors.selectCore);
  const user = useSelector(UserSelectors.selectData);
  const offchainVoteData: iOffchainVoteData | undefined = useSelector(VoteSelectors.selectVoteData);

  const { account, library } = useWeb3React<Web3Provider>();

  const [selectedJars, setSelectedJars] = useState<string[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedSidechainJars, setSelectedSidechainJars] = useState<string[]>([]);
  const [isMainnet, setIsMainnet] = useState(false);
  library?.getNetwork().then((n) => (n.chainId === 1 ? setIsMainnet(true) : setIsMainnet(false)));
  return (
    <>
      {core ?
        isMainnet ? (
          <>
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
            <ChainSelect core={core} setSelectedChains={setSelectedChains} />
            <JarSelect core={core} mainnet={false} setSelectedJars={setSelectedSidechainJars} />
            <div>
              {selectedChains.length > 0 && (
                <ChainTable
                  selectedChains={selectedChains}
                  core={core}
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
              {selectedChains.length > 0 && selectedSidechainJars.length > 0 && (
                <OffchainVoteButton
                  vote={castVoteSideChain}
                  provider={library}
                  account={account}
                  selectedChains={selectedChains}
                  selectedJars={selectedSidechainJars}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <p>TEMP - You must be on mainnet to Vote. ( add modal for this message with button to switch to mainnet )</p>
          </>
        )
      : (
        <LoadingIndicator waitForCore />
      )}
      <PickleToastContainer />
    </>
  );
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">
        {t("v2.dill.vote.title")}
      </h1>
      <h2 className="font-body font-normal text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.dill.vote.description")}
      </h2>
    </>
  );
};

Vote.PageTitle = PageTitle;

export { getStaticProps } from "../../../util/locales";

export default Vote;
