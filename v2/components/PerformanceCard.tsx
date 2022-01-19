import { FC, useState } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { CashIcon } from "@heroicons/react/solid";

import Button from "./Button";
import HarvestModal, { RewardRowProps } from "./HarvestModal";
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
import { PickleAsset } from "picklefinance-core/lib/model/PickleModelJson";

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
  const jarData = getUserAssetDataWithPricesForJars(core, userdata);
  let runningUsd = 0;
  for (let i = 0; i < jarData.length; i++) {
    runningUsd += jarData[i].earnedPickles.tokensUSD;
  }
  if (userdata.dill && userdata.dill.claimable) {
    const wei: BigNumber = BigNumber.from(userdata.dill.claimable);
    const dillRewardUsd =
      wei.div(1e10).div(1e8).toNumber() * core.prices.pickle;
    runningUsd += dillRewardUsd;
  }
  return formatUsd(runningUsd);
};


export const getUserAssetDataWithPricesForJars = (
  core: PickleModelJson.PickleModelJson,
  userdata: UserData,
): UserAssetDataWithPrices[] => {
  const ret: UserAssetDataWithPrices[] = [];
  for (let i = 0; i < userdata.tokens.length; i++) {
    const key = userdata.tokens[i].assetKey;
    const jar = core.assets.jars.find((x) => x.details.apiKey === key);
    if (jar) {
      const data: UserAssetDataWithPrices = getUserAssetDataWithPrices(
        jar, core,userdata);
      if (data) {
        ret.push(data);
      }
    }
  }
  return ret;
};

export const getAllPickleAssets = (core: PickleModelJson.PickleModelJson): PickleAsset[] => {
  const ret: PickleAsset[] = [];
  return ret.concat(core.assets.jars).concat(core.assets.standaloneFarms).concat(core.assets.external);
} 
export const userVisibleStringForPickleAsset = (apiKey: string, 
  core: PickleModelJson.PickleModelJson): string | undefined => {
  const allAssets: PickleAsset[] = getAllPickleAssets(core);
  const asset: PickleAsset | undefined = allAssets.find((x)=>x.details.apiKey === apiKey);
  return asset ? asset.depositToken.name : undefined;
}

export const getRewardRowPropertiesForRewards = (
  core: PickleModelJson.PickleModelJson,
  userdata: UserData,
): RewardRowProps[] => {
  const ret: RewardRowProps[] = [];
  const jarData = getUserAssetDataWithPricesForJars(core, userdata);
  const jarHarvester = {
    harvest: async (): Promise<boolean> => {
      // TODO
      return false;
    }
  };
  const dillHarvester = {
    harvest: async (): Promise<boolean> => {
      // TODO
      return false;
    }
  };
  for (let i = 0; i < jarData.length; i++) {
    const descriptor = userVisibleStringForPickleAsset(jarData[i].assetId, core) || "unknown";
    const earnedPickles = parseFloat(jarData[i].earnedPickles.tokens);
    if( earnedPickles > 0 ) {
      ret.push({
        descriptor: descriptor,
        tokenString: "PICKLEs", // TODO i18n
        rewardCount: parseFloat(jarData[i].earnedPickles.tokens),
        harvester: jarHarvester,
      });
    }
  }
  if (userdata.dill && userdata.dill.claimable) {
    const wei: BigNumber = BigNumber.from(userdata.dill.claimable);
    const dillRewardPickles = wei.div(1e10).div(1e8).toNumber();
    ret.push({
      descriptor: "Dill Rewards", // TODO i18n
      tokenString: "PICKLEs",
      rewardCount: dillRewardPickles,
      harvester: dillHarvester,
    });
  }
  return ret;
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
  const rewardRowProps: RewardRowProps[] = allCore && userModel ? getRewardRowPropertiesForRewards(allCore, userModel) : [];
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
              <Image
                src="/pickle-icon.svg"
                width={200}
                height={200}
                layout="responsive"
                alt="Pickle Finance" // TODO i18n
                title="Pickle Finance" // TODO i18n
              />
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
        <HarvestModal isOpen={isOpen} closeModal={closeModal} harvestables={rewardRowProps} />
      </div>
    </div>
  );
};

export default PerformanceCard;
