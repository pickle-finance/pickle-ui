import { FC } from "react";
import { useTranslation } from "next-i18next";

import { JarWithData } from "v2/store/core";
import { ChainNetwork } from "picklefinance-core";
import MoreInfo from "v2/components/MoreInfo";
import { formatAPY } from "v2/utils";

interface Props {
  jar: JarWithData;
  userDillRatio: number;
}

const FarmAPY: FC<Props> = ({ jar, userDillRatio }) => {
  const { t } = useTranslation("common");
  let aprRangeString, pickleAprMin, pickleAprMax, pickleApr;

  // Case #1: only jar, no farm
  if (!jar.farm?.details?.farmApyComponents) {
    aprRangeString = (jar.aprStats?.apy || 0).toFixed(3) + "%";
  } else {
    // Case #2: mainnet - show APR range for min/max DILL
    if (jar.farm.details.farmApyComponents[0]?.maxApr && jar.chain === ChainNetwork.Ethereum) {
      pickleAprMin = jar.farm.details.farmApyComponents[0].apr || 0;
      pickleAprMax = jar.farm.details.farmApyComponents[0].maxApr || 0;
      const aprMin = (jar.aprStats?.apy || 0) + pickleAprMin;
      const aprMax = (jar.aprStats?.apy || 0) + pickleAprMax;
      aprRangeString = `${aprMin.toFixed(2)}% ~ ${aprMax.toFixed(2)}%`;
    } else {
      // Case #3: sidechain with pickle farm
      pickleApr = jar.farm.details.farmApyComponents[0]?.apr;
      aprRangeString = `${((jar.aprStats?.apy || 0) + (pickleApr || 0)).toFixed(2)}%`;
    }
  }

  const userStakedNum =
    parseFloat(jar.depositTokensInFarm?.tokens || "0") +
    parseFloat(jar.depositTokensInJar?.tokens || "0");
  const userDerivedBalance = userStakedNum * 0.4;
  const userAdjustedBalance = (jar.farm?.details?.tokenBalance || 0) * userDillRatio * 0.6;
  const userAdjustedPickleApy =
    ((jar.farm?.details?.farmApyComponents?.[0]?.maxApr || 0) *
      Math.min(userStakedNum, userDerivedBalance + userAdjustedBalance)) /
    (userStakedNum || 1);

  const userApy = userAdjustedPickleApy + (jar.aprStats?.apy || 0);
  const userApyString = t("v2.farms.yourApy", { apy: formatAPY(userApy || 0) });

  const { aprStats } = jar;
  const difference = (aprStats?.apy || 0) - (aprStats?.apr || 0);

  return (
    <>
      <span className="font-title font-medium text-base leading-5">{aprRangeString}</span>
      <MoreInfo>
        <div className="text-foreground-alt-200 text-sm">
          <p className="font-bold text-primary">{`${t("farms.baseAPRs")}`}</p>
          {pickleApr && (
            <div className="flex justify-between items-end">
              <div className="font-bold mr-2">PICKLE:</div>
              <div className="text-foreground">{`${formatAPY(pickleApr || 0)}`}</div>
            </div>
          )}
          {pickleAprMin && pickleAprMax && (
            <div className="flex justify-between items-end">
              <div className="font-bold mr-2">PICKLE:</div>
              <div className="text-foreground">{`${formatAPY(pickleAprMin || 0)} ~ ${formatAPY(
                pickleAprMax || 0,
              )}`}</div>
            </div>
          )}
          {aprStats?.components.length &&
            aprStats.components.map(({ name, apr }) => {
              return isNaN(apr) || apr > 1e6 ? null : (
                <div className="flex justify-between items-end">
                  <div className="font-bold mr-2">{name.toUpperCase()}:</div>
                  <div className="text-foreground">{apr.toFixed(2)}%</div>
                </div>
              );
            })}
          <div className="flex justify-between items-end">
            <span className="font-bold mr-2">{t("v2.farms.compounding")} ✨:</span>
            <span className="text-foreground">{difference.toFixed(2)}%</span>
          </div>
        </div>
      </MoreInfo>
      {jar.chain === ChainNetwork.Ethereum && Boolean(userStakedNum) && (
        <p className="font-normal text-xs text-foreground-alt-200">{userApyString}</p>
      )}
    </>
  );
};

export default FarmAPY;
