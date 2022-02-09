import { FC } from "react";
import { useTranslation } from "next-i18next";

interface Props {
  active?: boolean;
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
      title: t("dill.totalLocked"),
    },
    {
      value: Number(
        dill?.dillWeeks[dill.dillWeeks.length - 1].weeklyDillAmount,
      ).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      title: t("dill.weeklyReward"),
    },
    { value: "101.78%", title: t("dill.currentAPY") },
    { value: "Thu, Jun 10 2021", title: t("dill.nextDistribution") },
  ];

  return (
    <>
      <h1 className="font-body font-bold text-xl mb-4">
        {t("v2.dill.revenueShareStats")}
      </h1>
      <div className="flex justify-between align-center bg-black-light rounded-xl border border-gray-dark shadow px-6 py-7">
        {items?.map((item, i) => (
          <aside key={i}>
            <p>{item.value}</p>
            <p>{item.title}</p>
          </aside>
        ))}
      </div>
    </>
  );
};

export default RevenueStats;
