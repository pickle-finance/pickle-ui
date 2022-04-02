import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import type { PickleFinancePage } from "v2/types";
import { CoreSelectors } from "v2/store/core";
import LoadingIndicator from "v2/components/LoadingIndicator";
import JarSelect from "v2/features/dill/vote/JarSelect";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { JarTable } from "v2/features/dill/vote/JarTable";
import castVote from "v2/features/dill/vote/sidechains/CastVote";
import { ChainSelect } from "v2/features/dill/vote/sidechains/ChainSelect";
import { VoteButton } from "v2/features/dill/vote/sidechains/VoteButtonSideChain";
import { ChainTable } from "v2/features/dill/vote/sidechains/ChainTable";
import PickleToastContainer from "v2/components/PickleToastContainer";
import { iOffchainVoteData, VoteSelectors } from "v2/store/offchainVotes";
import { PickleModelJson } from "picklefinance-core";

const Vote: PickleFinancePage = () => {
  const core: PickleModelJson.PickleModelJson | undefined = useSelector(CoreSelectors.selectCore);
  const offchainVoteData: iOffchainVoteData | undefined = useSelector(VoteSelectors.selectVoteData);
  const { account, library } = useWeb3React<Web3Provider>();
  const [selectedJars, setSelectedJars] = useState<string[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  return (
    <>
      {core ? (
        <>
          <ChainSelect core={core} setSelectedChains={setSelectedChains} />
          <JarSelect core={core} mainnet={false} setSelectedJars={setSelectedJars} />
          <div>
            {selectedChains.length > 0 && (
              <ChainTable
                selectedChains={selectedChains}
                core={core}
                offchainVoteData={offchainVoteData}
                wallet={account}
              />
            )}
            {selectedJars.length > 0 && (
              <JarTable
                selectedJars={selectedJars}
                core={core}
                mainnet={false}
                offchainVoteData={offchainVoteData}
                wallet={account}
              />
            )}
            {selectedChains.length > 0 && selectedJars.length > 0 && (
              <VoteButton
                vote={castVote}
                provider={library}
                account={account}
                selectedChains={selectedChains}
                selectedJars={selectedJars}
              />
            )}
          </div>
        </>
      ) : (
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

export { getStaticProps } from "../../../../util/locales";

export default Vote;
