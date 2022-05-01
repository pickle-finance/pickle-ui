import { FC } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useTranslation } from "next-i18next";
import { DillDetails } from "picklefinance-core/lib/model/PickleModelJson";
import { formatEther } from "ethers/lib/utils";

import { CoreSelectors } from "v2/store/core";
import { formatDollars, formatDate, formatNumber, formatPercentage } from "v2/utils";
import MoreInfo from "v2/components/MoreInfo";
import { useProtocolIncome } from "./flows/hooks";
import { PickleModelJson } from "picklefinance-core";

interface Props {
  dill: DillDetails;
}

const RevenueStats: FC<Props> = ({ dill }) => {
  const { t } = useTranslation("common");
  const core = useSelector(CoreSelectors.selectCore);
  const picklePrice = useSelector(CoreSelectors.selectPicklePrice);
  const { weeklyDistribution } = useProtocolIncome(
    core ? core : ({} as PickleModelJson.PickleModelJson),
  );
  const { dillWeeks } = dill;
  if (!weeklyDistribution || !dillWeeks) return <></>;
  const upcomingDistribution = dillWeeks[dillWeeks.length - 1];

  const ratio = dill.totalDill / dill.pickleLocked;
  const averageLock = Math.round(ratio * 4 * 100) / 100;

  const dillAPY =
    weeklyDistribution && dill.totalDill
      ? (weeklyDistribution / (dill.totalDill * picklePrice)) * 52 * 100
      : 0;

  return (
    <>
      <h1 className="font-body font-bold text-xl mb-4">{t("v2.dill.revenueShareStats")}</h1>
      <div className="grid grid-cols-2 xl:grid-cols-5 bg-background-light rounded-xl border border-foreground-alt-500 shadow px-6 py-7">
        <div className="mb-6 xl:mb-0">
          <h2 className="font-title font-medium text-foreground text-lg leading-5">
            {formatDollars(dill.pickleLocked * picklePrice)}
            <MoreInfo>
              <div className="flex items-center font-bold text-sm">
                <span className="text-foreground mr-1">{formatNumber(dill.pickleLocked)}</span>
                <div className="inline-block w-6 h-6">
                  <Image
                    src="/pickle-icon.svg"
                    width={24}
                    height={24}
                    layout="intrinsic"
                    alt="PICKLE"
                    title="PICKLE"
                  />
                </div>
                <span className="mr-2 text-foreground-alt-200">=</span>
                <span className="text-foreground mr-1">{formatNumber(dill.totalDill)}</span>
                <div className="inline-block w-6 h-6">
                  <Image
                    src="/dill-icon.png"
                    width={24}
                    height={24}
                    layout="intrinsic"
                    alt="DILL"
                    title="DILL"
                  />
                </div>
              </div>
            </MoreInfo>
          </h2>
          <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {t("v2.dill.totalValueLocked")}
          </p>
        </div>
        <div className="mb-6 xl:mb-0">
          <h2 className="font-title font-medium text-foreground text-lg leading-5">
            {formatPercentage(dillAPY)}
          </h2>
          <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {t("v2.dill.currentAPY")}
          </p>
        </div>
        <div>
          <h2 className="font-title font-medium text-foreground text-lg leading-5">
            {formatDollars(upcomingDistribution.weeklyPickleAmount * picklePrice)}
            <MoreInfo>
              <div className="flex items-center font-bold text-sm">
                <span className="text-foreground mr-1">
                  {formatNumber(upcomingDistribution.weeklyPickleAmount)}
                </span>
                <div className="inline-block w-6 h-6">
                  <Image
                    src="/pickle-icon.svg"
                    width={24}
                    height={24}
                    layout="intrinsic"
                    alt="PICKLE"
                    title="PICKLE"
                  />
                </div>
              </div>
            </MoreInfo>
          </h2>
          <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {t("v2.dill.upcomingDistributionValue")}
          </p>
        </div>
        <div className="mb-6 xl:mb-0">
          <h2 className="font-title font-medium text-foreground text-lg leading-5">
            {formatDate(new Date(upcomingDistribution.distributionTime))}
          </h2>
          <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {t("v2.dill.upcomingDistributionDate")}
          </p>
        </div>
        <div>
          <h2 className="font-title font-medium text-foreground text-lg leading-5">
            {t("v2.time.year_plural", { count: averageLock })}
          </h2>
          <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {t("v2.dill.averageLock")}
          </p>
        </div>
      </div>
    </>
  );
};

export default RevenueStats;
