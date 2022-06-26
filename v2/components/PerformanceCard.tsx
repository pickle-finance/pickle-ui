import { FC, useState } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { CashIcon, ClockIcon } from "@heroicons/react/solid";
import { BigNumber, ethers } from "ethers";
import { ChainNetwork, PickleModelJson } from "picklefinance-core";
import { UserData } from "picklefinance-core/lib/client/UserModel";

import Button from "./Button";
import HarvestModal, { RewardRowProps } from "./HarvestModal";
import { CoreSelectors } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { getUserAssetDataWithPrices, UserAssetDataWithPrices } from "v2/utils/user";
import { formatUsd } from "v1/util/api";
import { findAsset, findJar, visibleStringForAsset } from "v2/store/core.helpers";
import { useAppSelector } from "v2/store";
import { useAccount } from "v2/hooks";

export const getTotalBalances = (
  core: PickleModelJson.PickleModelJson,
  userdata: UserData,
): string => {
  const balance = Object.entries(userdata.tokens).reduce((result, [key]) => {
    const jar = findJar(key, core);

    if (!jar) return result;

    const data: UserAssetDataWithPrices = getUserAssetDataWithPrices(jar, core, userdata);
    if (data) {
      result += data.depositTokensInJar.tokensUSD || 0;
      result += data.depositTokensInFarm.tokensUSD || 0;
    }

    return result;
  }, 0);

  return formatUsd(balance);
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
  if (userdata.dill.claimable || userdata.dill.totalClaimableTokenV2) {
    const picklesWei = BigNumber.from(userdata.dill.claimable).add(
      BigNumber.from(userdata.dill.totalClaimableTokenV2),
    );
    const dillPickleRewardUsd =
      parseFloat(ethers.utils.formatEther(picklesWei)) * core.prices.pickle;

    runningUsd += dillPickleRewardUsd;
  }

  if (userdata.dill.totalClaimableETHV2) {
    const wei = BigNumber.from(userdata.dill.totalClaimableETHV2);
    const dillPickleRewardUsd = parseFloat(ethers.utils.formatEther(wei)) * core.prices.weth;

    runningUsd += dillPickleRewardUsd;
  }

  return formatUsd(runningUsd);
};

export const getPendingHarvestsUsd = (
  core: PickleModelJson.PickleModelJson,
  userdata: UserData,
): string => {
  let runningUsd = 0;

  Object.entries(userdata.tokens).forEach(([key, tokenData]) => {
    const jar = findJar(key, core);

    if (!jar) return;

    const totalPTokens = jar.details?.tokenBalance;
    if (totalPTokens) {
      const userShare =
        (parseFloat(tokenData!.pAssetBalance || "0") +
          parseFloat(tokenData!.pStakedBalance || "0")) /
        (totalPTokens * 1e18);
      const pendingHarvest = jar.details.harvestStats?.harvestableUSD;
      if (pendingHarvest) {
        const userShareHarvestUsd = userShare * pendingHarvest * 0.8;
        runningUsd += userShareHarvestUsd;
      }
    }
  });

  return formatUsd(runningUsd);
};

export const getUserAssetDataWithPricesForJars = (
  core: PickleModelJson.PickleModelJson,
  userdata: UserData,
): UserAssetDataWithPrices[] =>
  Object.entries(userdata.tokens).reduce((result, [key]) => {
    const jar = findJar(key, core);

    if (!jar) return result;

    const data: UserAssetDataWithPrices = getUserAssetDataWithPrices(jar, core, userdata);

    if (data) result.push(data);

    return result;
  }, [] as UserAssetDataWithPrices[]);

export const getRewardRowPropertiesForRewards = (
  core: PickleModelJson.PickleModelJson,
  userdata: UserData,
  t: (key: string) => string,
): RewardRowProps[] => {
  const ret: RewardRowProps[] = [];
  const jarData = getUserAssetDataWithPricesForJars(core, userdata);
  for (let i = 0; i < jarData.length; i++) {
    const { assetId } = jarData[i];
    const descriptor = visibleStringForAsset(assetId, core) || "";
    const asset = findAsset(assetId, core);

    if (!asset) continue;

    const earnedPickles = parseFloat(jarData[i].earnedPickles.tokens);

    if (earnedPickles > 0) {
      ret.push({
        asset,
        descriptor,
        harvestableAmount: jarData[i].earnedPickles.wei,
        claimableV1: BigNumber.from(0),
        claimableEthV2: BigNumber.from(0),
        claimableTokenV2: BigNumber.from(0),
        rewarderType: "farm",
        network: asset.chain,
      });
    }
  }

  if (
    userdata.dill &&
    (userdata.dill.claimable ||
      userdata.dill.totalClaimableETHV2 ||
      userdata.dill.totalClaimableTokenV2)
  ) {
    const wei = BigNumber.from(userdata.dill.claimable);

    ret.push({
      asset: undefined,
      descriptor: t("v2.dill.dillRewards"),
      harvestableAmount: BigNumber.from(0),
      claimableV1: BigNumber.from(userdata.dill.claimable),
      claimableTokenV2: BigNumber.from(userdata.dill.claimableV2),
      claimableEthV2: BigNumber.from(userdata.dill.claimableETHV2),
      rewarderType: "dill",
      network: ChainNetwork.Ethereum,
    });
  }
  return ret;
};

const PerformanceCard: FC = () => {
  const { t } = useTranslation("common");
  const account = useAccount();
  let [isOpen, setIsOpen] = useState<boolean>(false);
  const userModel = useAppSelector((state) => UserSelectors.selectData(state, account));

  const allCore = useAppSelector(CoreSelectors.selectCore);
  const userTotalBalance = allCore && userModel ? getTotalBalances(allCore, userModel) : 0;
  const unclaimedRewards = allCore && userModel ? getPendingRewardsUsd(allCore, userModel) : 0;
  const pendingHarvest = allCore && userModel ? getPendingHarvestsUsd(allCore, userModel) : 0;
  const rewardRowProps: RewardRowProps[] =
    allCore && userModel ? getRewardRowPropertiesForRewards(allCore, userModel, t) : [];
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div className="bg-gradient rounded-2xl border border-foreground-alt-500 shadow">
      <div className="relative px-6 pt-4 sm:px-8 sm:pt-6 border-b border-foreground-alt-500">
        <h2 className="text-lg font-normal text-foreground-alt-200 mb-7">
          {t("v2.dashboard.performance")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3 mb-5">
          <div className="flex mb-6 xl:mb-0">
            <div className="bg-primary p-2 w-12 h-12 rounded-full mr-6">
              <CashIcon className="text-foreground-button" />
            </div>
            <div>
              <p className="font-title font-medium text-2xl leading-7 mb-1">{userTotalBalance}</p>
              <p className="text-foreground-alt-200 text-sm">{t("v2.balances.balance")}</p>
            </div>
          </div>
          <div className="flex mb-6 xl:mb-0">
            <div className="bg-background p-2 w-12 h-12 rounded-full mr-6">
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
              <p className="font-title font-medium text-2xl leading-7 mb-1">{unclaimedRewards}</p>
              <p className="text-foreground-alt-200 text-sm">
                {t("v2.dashboard.unclaimedRewards")}
              </p>
            </div>
          </div>
          <div className="flex mb-6 xl:mb-0">
            <div className="bg-primary p-2 w-12 h-12 rounded-full mr-6">
              <ClockIcon className="text-foreground-button" />
            </div>
            <div>
              <p className="font-title font-medium text-2xl leading-7 mb-1">{pendingHarvest}</p>
              <p className="text-foreground-alt-200 text-sm">{t("v2.dashboard.pendingHarvests")}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative px-6 py-4 sm:px-8 sm:py-6">
        <Button
          onClick={openModal}
          size="normal"
          state={rewardRowProps.length > 0 ? "enabled" : "disabled"}
        >
          {t("v2.dashboard.harvestRewards")}
        </Button>
        <HarvestModal isOpen={isOpen} closeModal={closeModal} harvestables={rewardRowProps} />
      </div>
    </div>
  );
};

export default PerformanceCard;
