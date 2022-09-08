import { FC } from "react";
import { useTranslation } from "next-i18next";

import { AssetWithData, BrineryWithData } from "v2/store/core";
import { ChainNetwork } from "picklefinance-core";
import MoreInfo from "v2/components/MoreInfo";
import { formatPercentage } from "v2/utils";
import { isBrinery, isExternalAsset, isJar, isStandaloneFarm } from "v2/store/core.helpers";

interface Props {
  asset: AssetWithData | BrineryWithData;
  userDillRatio: number;
}

const FarmAPY: FC<Props> = ({ asset, userDillRatio }) => {
  const { t } = useTranslation("common");
  let aprRangeString, pickleAprMin, pickleAprMax, pickleApr, userStakedNum, userApyString, extraReward;

  // Case #1: only jar or brinery, no farm
  if (isBrinery(asset) || isExternalAsset(asset)) {
    aprRangeString = formatPercentage(asset.aprStats?.apy || 0);
  } else {
    const farmDetails = isStandaloneFarm(asset) ? asset.details : asset.farm?.details;

    if (farmDetails?.farmApyComponents) {
      // Case #2: mainnet - show APR range for min/max DILL
      if (farmDetails.farmApyComponents[0]?.maxApr && asset.chain === ChainNetwork.Ethereum) {
        pickleAprMin = farmDetails.farmApyComponents[0].apr || 0;
        pickleAprMax = farmDetails.farmApyComponents[0].maxApr || 0;
        const aprMin = (asset.aprStats?.apy || 0) + pickleAprMin;
        const aprMax = (asset.aprStats?.apy || 0) + pickleAprMax;
        aprRangeString = `${formatPercentage(aprMin)} ~ ${formatPercentage(aprMax)}`;

        userStakedNum =
          parseFloat(asset.depositTokensInFarm?.tokens || "0") +
          parseFloat(asset.depositTokensInJar?.tokens || "0");
        const userDerivedBalance = userStakedNum * 0.4;
        const userAdjustedBalance = (farmDetails.tokenBalance || 0) * userDillRatio * 0.6;
        const userAdjustedPickleApy =
          ((farmDetails.farmApyComponents[0]?.maxApr || 0) *
            Math.min(userStakedNum, userDerivedBalance + userAdjustedBalance)) /
          (userStakedNum || 1);

        const userApy = userAdjustedPickleApy + (asset.aprStats?.apy || 0);
        userApyString = t("v2.farms.yourApy", { apy: formatPercentage(userApy || 0) });
      } else {
        // Case #3: sidechain with pickle farm
        pickleApr = farmDetails.farmApyComponents[0]?.apr;
        const totalApr = farmDetails.farmApyComponents?.reduce((cum, cur) => cum + (cur.apr ?? 0), 0);
        if (totalApr - pickleApr > 0) extraReward = farmDetails.farmApyComponents[1];
        aprRangeString = formatPercentage((asset.aprStats?.apy || 0) + (totalApr || 0));
      }
    } else {
      aprRangeString = formatPercentage(asset.aprStats?.apy || 0);
    }
  }

  const apr = aprRangeString.substring(0, aprRangeString.indexOf("%")).replace(/,/g, "");
  const highApr = parseFloat(apr) > 10000;
  const { aprStats } = asset;
  const difference = (aprStats?.apy || 0) - (aprStats?.apr || 0);
  const harvestableStr = t("farms.harvestable");

  return (
    <>
      <span className="font-title font-medium text-base leading-5">
        {highApr ? ">10,000%" : aprRangeString}
      </span>
      <MoreInfo>
        <div className="text-foreground-alt-200 text-sm">
          <p className="font-bold text-primary">{`${t("farms.baseAPRs")}`}</p>
          {pickleApr && (
            <div className="flex justify-between items-end">
              <div className="font-bold mr-2">PICKLE ({harvestableStr}):</div>
              <div className="text-foreground">{formatPercentage(pickleApr || 0)}</div>
            </div>
          )}
          {pickleAprMin && pickleAprMax && (
            <div className="flex justify-between items-end">
              <div className="font-bold mr-2">PICKLE ({harvestableStr}):</div>
              <div className="text-foreground">{`${formatPercentage(
                pickleAprMin || 0,
              )} ~ ${formatPercentage(pickleAprMax || 0)}`}</div>
            </div>
          )}
          {extraReward && (
            <div className="flex justify-between items-end">
              <div className="font-bold mr-2">{`${extraReward.name.toUpperCase()} (${harvestableStr}):`}</div>
              <div className="text-foreground">{formatPercentage(extraReward.apr || 0)}</div>
            </div>
          )}
          {aprStats?.components.length &&
            aprStats.components.map(({ name, apr }) => {
              return isNaN(apr) || apr > 1e6 ? null : (
                <div key={name} className="flex justify-between items-end">
                  <div className="font-bold mr-2">{name.toUpperCase()}:</div>
                  <div className="text-foreground">{formatPercentage(apr)}</div>
                </div>
              );
            })}
          <div className="flex justify-between items-end">
            <span className="font-bold mr-2">{t("v2.farms.compounding")} ✨:</span>
            <span className="text-foreground">{formatPercentage(difference)}</span>
          </div>
        </div>
      </MoreInfo>
      {asset.chain === ChainNetwork.Ethereum && Boolean(userStakedNum) && (
        <p className="font-normal text-xs text-foreground-alt-200">{userApyString}</p>
      )}
    </>
  );
};

export default FarmAPY;
