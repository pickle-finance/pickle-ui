import { FC, useState } from "react";
import type { PickleFinancePage } from "v2/types";
import { TFunction, useTranslation } from "next-i18next";
import { CoreSelectors } from "v2/store/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { iOffchainVoteData, VoteSelectors } from "v2/store/offchainVotes";
import { UserSelectors } from "v2/store/user";

import PickleToastContainer from "v2/components/PickleToastContainer";
import LoadingIndicator from "v2/components/LoadingIndicator";

// import VoteWeightCharts from "v2/features/vote/Charts";
import MainnetVoteWeightCharts from "v2/features/vote/MainnetOnlyCharts";
import MainnetVote from "v2/features/vote/MainnetVote";
// import OffchainVote from "v2/features/vote/OffchainVote";
import { useAppSelector } from "v2/store";
import { useAccount } from "v2/hooks";
import ConnectButton from "v2/features/farms/ConnectButton";

const Vote: PickleFinancePage = () => {
  const { library } = useWeb3React<Web3Provider>();
  const account = useAccount();
  const core = useAppSelector(CoreSelectors.selectCore);
  const user = useAppSelector((state) => UserSelectors.selectData(state, account));
  const offchainVoteData: iOffchainVoteData | undefined = useAppSelector(
    VoteSelectors.selectVoteData,
  );
  const { t } = useTranslation("common");

  const [onMainnet, setOnMainnet] = useState(true);

  library?.getNetwork().then((n) => (n.chainId === 1 ? setOnMainnet(true) : setOnMainnet(false)));

  return (
    <>
      {onMainnet ? (
        core ? (
          user ? (
            offchainVoteData ? (
              <>
                {/* <VoteWeightCharts core={core} offchainVoteData={offchainVoteData} /> */}
                <MainnetVoteWeightCharts core={core} offchainVoteData={offchainVoteData} />
                <MainnetVote core={core} user={user} />
                <hr className="border-foreground-alt-500 mt-5 mb-5" />
                {/* <OffchainVote core={core} offchainVoteData={offchainVoteData} /> */}
              </>
            ) : (
              <LoadingIndicator waitForVoteData />
            )
          ) : (
            <LoadingIndicator waitForUserModel customText="Loading Chart Data" />
          )
        ) : (
          <LoadingIndicator waitForCore customText="Loading Chart Data" />
        )
      ) : (
        <SwitchToMainnet t={t} />
      )}
      <PickleToastContainer />
    </>
  );
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="font-title font-medium min-w-200 text-2xl sm:text-3xl pt-2">
        {t("v2.dill.vote.title")}
      </h1>
      <h2 className="font-body font-normal min-w-300 text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.dill.vote.description")}
      </h2>
    </>
  );
};

const SwitchToMainnet: FC<{ t: TFunction }> = ({ t }) => (
  <div className="w-full grid place-items-center">
    <div className="bg-background-light min-w-min grid place-items-center rounded-xl w-1/2">
      <p className="p-5">{t("v2.dill.vote.connectToMainnet")}</p>
      <div className="p-5">
        <ConnectButton network={{ name: "eth", visibleName: "Ethereum", chainId: 1 }} />
      </div>
    </div>
  </div>
);

Vote.PageTitle = PageTitle;

export { getStaticProps } from "v1/util/locales";

export default Vote;
