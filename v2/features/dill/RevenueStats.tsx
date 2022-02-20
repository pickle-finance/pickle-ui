import { FC } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useTranslation } from "next-i18next";
import { DillDetails } from "picklefinance-core/lib/model/PickleModelJson";

import { CoreSelectors } from "v2/store/core";
import { formatDollars, formatDate, formatNumber } from "v2/utils";
import MoreInfo from "v2/components/MoreInfo";

interface Props {
  dill: DillDetails;
}

const RevenueStats: FC<Props> = ({ dill }) => {
  const { t } = useTranslation("common");
  const picklePrice = useSelector(CoreSelectors.selectPicklePrice);
  const { dillWeeks } = dill;
  const upcomingDistribution = dillWeeks[dillWeeks.length - 1];

  return (
    <>
      <h1 className="font-body font-bold text-xl mb-4">
        {t("v2.dill.revenueShareStats")}
      </h1>
      <div className="grid grid-cols-2 xl:grid-cols-4 bg-background-light rounded-xl border border-gray-dark shadow px-6 py-7">
        <div className="mb-6 xl:mb-0">
          <h2 className="font-title font-medium text-foreground text-lg leading-5">
            {formatDollars(dill.pickleLocked * picklePrice)}
            <MoreInfo
              secondaryText={
                <div className="flex items-center font-bold">
                  <span className="text-foreground mr-1">
                    {formatNumber(dill.pickleLocked)}
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
                  <span className="mr-2 text-foreground-alt-200">=</span>
                  <span className="text-foreground mr-1">
                    {formatNumber(dill.totalDill)}
                  </span>
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
              }
            />
          </h2>
          <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {t("v2.dill.totalValueLocked")}
          </p>
        </div>
        <div className="mb-6 xl:mb-0">
          <h2 className="font-title font-medium text-foreground text-lg leading-5">
            {/* TODO update this */}
            101.78%
          </h2>
          <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {t("v2.dill.currentAPY")}
          </p>
        </div>
        <div>
          <h2 className="font-title font-medium text-foreground text-lg leading-5">
            {formatDollars(
              upcomingDistribution.weeklyPickleAmount * picklePrice,
            )}
            <MoreInfo
              secondaryText={
                <div className="flex items-center font-bold">
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
              }
            />
          </h2>
          <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {t("v2.dill.upcomingDistributionValue")}
          </p>
        </div>
        <div>
          <h2 className="font-title font-medium text-foreground text-lg leading-5">
            {formatDate(new Date(upcomingDistribution.distributionTime))}
          </h2>
          <p className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
            {t("v2.dill.upcomingDistributionDate")}
          </p>
        </div>
      </div>
    </>
  );
};

export default RevenueStats;
