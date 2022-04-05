import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import type { PickleFinancePage } from "v2/types";
import { CoreSelectors } from "v2/store/core";
import LoadingIndicator from "v2/components/LoadingIndicator";
import JarSelect from "v2/features/dill/vote/JarSelect";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import castVote from "v2/features/dill/vote/mainnet/CastVoteMainnet";
import { VoteButton } from "v2/features/dill/vote/mainnet/VoteButtonMainnet";
import PickleToastContainer from "v2/components/PickleToastContainer";
import { JarTable } from "v2/features/dill/vote/JarTable";
import { UserSelectors } from "v2/store/user";
import ChartContainer from "v2/features/dill/vote/ChartContainer";

const Vote: PickleFinancePage = () => {
  const core = useSelector(CoreSelectors.selectCore);
  const user = useSelector(UserSelectors.selectData);
  const { library } = useWeb3React<Web3Provider>();
  const [selectedJars, setSelectedJars] = useState<string[]>([]);

  return (
    <>
      <div className="w-full inline-grid grid-cols-2 gap-4">
        <ChartContainer platformOrUser="platform" mainnet={true} core={core} />
        <ChartContainer platformOrUser="user" mainnet={true} core={core} user={user} />
      </div>
      {core ? (
        <>
          {/* {user ? (
            <PieChart user={user} />
          ) : (
            <LoadingIndicator waitForUserModel />
          )} */}
          <JarSelect core={core} mainnet={true} setSelectedJars={setSelectedJars} />
          {selectedJars.length > 0 && (
            <div>
              <JarTable selectedJars={selectedJars} core={core} mainnet={true} user={user} />
              <VoteButton
                vote={castVote}
                provider={library}
                selectedJars={selectedJars}
                core={core}
              />
            </div>
          )}
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
