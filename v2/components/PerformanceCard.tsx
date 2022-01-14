import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { CashIcon, DatabaseIcon } from "@heroicons/react/solid";

import Button from "./Button";
import HarvestModal from "./HarvestModal";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { useSelector } from "react-redux";
import { CoreSelectors } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { PickleModelJson } from "picklefinance-core";
import {
  getUserAssetDataWithPrices,
  UserAssetDataWithPrices,
} from "v2/features/farms/FarmsTableRowHeader";
import { BigNumber } from "ethers";
import { formatUsd } from "util/api";

export const getTotalBalances = (
  core: PickleModelJson.PickleModelJson,
  userdata: UserData,
): string => {
  let runningUsd = 0;
  for (let i = 0; i < userdata.tokens.length; i++) {
    const key = userdata.tokens[i].assetKey;
    const jar = core.assets.jars.find((x) => x.details.apiKey === key);
    if (jar) {
      const data: UserAssetDataWithPrices = getUserAssetDataWithPrices(
        jar,
        core,
        userdata,
      );
      if (data) {
        runningUsd += data.depositTokensInJar.tokensUSD || 0;
        runningUsd += data.depositTokensInFarm.tokensUSD || 0;
      }
    }
  }
  return formatUsd(runningUsd);
};

export const getPendingRewardsUsd = (
  core: PickleModelJson.PickleModelJson,
  userdata: UserData,
): string => {
  let runningUsd = 0;
  for (let i = 0; i < userdata.tokens.length; i++) {
    const key = userdata.tokens[i].assetKey;
    const jar = core.assets.jars.find((x) => x.details.apiKey === key);
    if (jar) {
      const data: UserAssetDataWithPrices = getUserAssetDataWithPrices(
        jar,
        core,
        userdata,
      );
      if (data) {
        runningUsd += data.earnedPickles.tokensUSD || 0;
      }
    }
  }
  if (userdata.dill && userdata.dill.claimable) {
    const wei: BigNumber = BigNumber.from(userdata.dill.claimable);
    const dillRewardUsd =
      wei.div(1e10).div(1e8).toNumber() * core.prices.pickle;
    runningUsd += dillRewardUsd;
  }
  return formatUsd(runningUsd);
};
const PerformanceCard: FC = () => {
  const { t } = useTranslation("common");
  let [isOpen, setIsOpen] = useState<boolean>(false);
  const userModel: UserData | undefined = useSelector(UserSelectors.selectData);
  const allCore = useSelector(CoreSelectors.selectCore);
  const userTotalBalance =
    allCore && userModel ? getTotalBalances(allCore, userModel) : 0;
  const unclaimedRewards =
    allCore && userModel ? getPendingRewardsUsd(allCore, userModel) : 0;
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div className="bg-gradient rounded-2xl border border-gray-dark shadow">
      <div className="relative px-6 pt-4 sm:px-8 sm:pt-6 border-b border-gray-dark">
        <h2 className="text-lg font-normal text-gray-light mb-7">
          {t("v2.dashboard.performance")}
        </h2>
        <div className="flex flex-wrap mb-9">
          <div className="flex mr-20 mb-6 xl:mb-0">
            <div className="bg-green p-2 w-12 h-12 rounded-full mr-6">
              <CashIcon />
            </div>
            <div>
              <p className="font-title font-medium text-2xl leading-7 mb-1">
                {userTotalBalance}
              </p>
              <p className="text-gray-light text-sm">
                {t("v2.balances.balance")}
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="bg-black p-2 w-12 h-12 rounded-full mr-6">
              <DatabaseIcon />
            </div>
            <div>
              <p className="font-title font-medium text-2xl leading-7 mb-1">
                {unclaimedRewards}
              </p>
              <p className="text-gray-light text-sm">
                {t("v2.dashboard.unclaimedRewards")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative px-6 py-4 sm:px-8 sm:py-6">
        <Button onClick={openModal} size="normal">
          {t("v2.dashboard.harvestRewards")}
        </Button>
        <HarvestModal isOpen={isOpen} closeModal={closeModal} />
      </div>
    </div>
  );
};

export default PerformanceCard;
