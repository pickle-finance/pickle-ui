import React, { FC } from "react";
import TvlChart from "./TvlChart";
import RevsChart from "./RevsChart";
import { ChainData, PlatformData } from "v2/types";
import { useTranslation } from "next-i18next";
import { classNames } from "v2/utils";

const ChartContainer: FC<{
  chart: string;
  dataSeries: PlatformData | ChainData;
  className?: string;
}> = ({ chart, dataSeries, className }) => {
  const { t } = useTranslation("common");

  interface IChartMap {
    [key: string]: JSX.Element;
  }

  const chartMap: IChartMap = {
    tvl: <TvlChart data={dataSeries.tvl} />,
    revs: <RevsChart data={dataSeries.revenues} />,
  };

  return (
    <div
      className={classNames(
        "bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8",
        className,
      )}
    >
      <h2 className="font-body font-bold text-xl">{t(`v2.stats.platform.${chart}ChartTitle`)}</h2>
      <aside className="h-[600px] px-3 py-10">{chartMap[chart]}</aside>
    </div>
  );
};

export default ChartContainer;
