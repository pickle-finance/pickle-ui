import { FC } from "react";
import { useTranslation } from "next-i18next";

interface Props {
  dill?: any;
}

const RevenueStats: FC<Props> = ({ dill }) => {
  const { t } = useTranslation("common");
  const items = [
    {
      value: Number(dill?.totalDill).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      title: t("v2.dill.totalValueLocked"),
    },
    { value: "101.78%", title: t("v2.dill.currentAPY") },
    {
      value: Number(
        dill?.dillWeeks[dill.dillWeeks.length - 1].weeklyDillAmount,
      ).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      title: t("v2.dill.upcomingDistributionValue"),
    },
    { value: "Thu, Jun 10 2021", title: t("v2.dill.upcomingDistributionDate") },
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
