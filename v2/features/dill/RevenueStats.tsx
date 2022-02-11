import { FC } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "next-i18next";
import { DillDetails } from "picklefinance-core/lib/model/PickleModelJson";

import { CoreSelectors } from "v2/store/core";
import { formatDollars, formatDate } from "v2/utils";

interface Props {
  dill: DillDetails;
}

const RevenueStats: FC<Props> = ({ dill }) => {
  const { t } = useTranslation("common");
  const picklePrice = useSelector(CoreSelectors.selectPicklePrice);
  const { dillWeeks } = dill;
  const upcomingDistribution = dillWeeks[dillWeeks.length - 1];

  const items = [
    {
      value: formatDollars(dill.pickleLocked * picklePrice),
      title: t("v2.dill.totalValueLocked"),
    },
    // TODO update this
    { value: "101.78%", title: t("v2.dill.currentAPY") },
    {
      value: formatDollars(
        upcomingDistribution.weeklyPickleAmount * picklePrice,
      ),
      title: t("v2.dill.upcomingDistributionValue"),
    },
    {
      value: formatDate(new Date(upcomingDistribution.distributionTime)),
      title: t("v2.dill.upcomingDistributionDate"),
    },
  ];

  return (
    <>
      <h1 className="font-body font-bold text-xl mb-4">
        {t("v2.dill.revenueShareStats")}
      </h1>
      <div className="flex justify-between align-center bg-black-light rounded-xl border border-gray-dark shadow px-6 py-7">
        {items.map(({ value, title }) => (
          <div key={title}>
            <h2 className="font-title font-medium text-white text-lg leading-5">
              {value}
            </h2>
            <p className="font-body text-gray-light font-normal text-xs leading-4">
              {title}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default RevenueStats;
