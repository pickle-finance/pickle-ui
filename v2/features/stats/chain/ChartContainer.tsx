import React, { FC } from "react";
import { ChainData } from "./types";
import TvlChart from "./TvlChart";
import RevsChart from "./RevsChart";
import { useTranslation } from "next-i18next";

export const ChartContainer: FC<{ chart: string; dataSeries: ChainData }> = ({
  chart,
  dataSeries,
}) => {
  const { t } = useTranslation("common");

  interface IChartMap {
    [key: string]: JSX.Element;
  }

  const chartMap: IChartMap = {
    tvl: (
      <TvlChart data={dataSeries ? dataSeries.tvl : []} />
    ),
    revs: (
      <RevsChart data={dataSeries ? dataSeries.revenues : []} />
    ),
  };

  return (
    <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8 mb-10">
      <h2 className="font-body font-bold text-xl">
        {t(`v2.stats.chain.${chart}ChartTitle`)}
      </h2>
      <aside className="h-[600px] px-3 py-10">{chartMap[chart]}</aside>
    </div>
  );
};
