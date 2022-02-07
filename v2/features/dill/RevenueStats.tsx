import { FC } from "react";
import { useTranslation } from "next-i18next";
import { classNames } from "v2/utils";

interface Props {
  active?: boolean;
  dill?: any;
}

export const RevenueStats: FC<Props> = ({ active, dill }) => {
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
      <h1 className="font-title font-medium text-xl sm:text-xl pt-10 pb-2 pl-1">
        {t("v2.dill.revenueShareStats")}
      </h1>
      <div
        className={classNames(
          active ? "bg-green" : "bg-gray-outline",
          "rounded-xl py-5 px-5 flex justify-between align-center",
        )}
      >
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
