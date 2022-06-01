import React, { FC } from "react";
import TvlChart from "../sharedCharts/TvlChart";
import RevsChart from "../sharedCharts/RevsChart";
import { PlatformData } from "v2/types";
import { useTranslation } from "next-i18next";

const ChartContainer: FC<{
  chart: string;
  dataSeries: PlatformData;
}> = ({ chart, dataSeries }) => {
  const { t } = useTranslation("common");

  interface IChartMap {
    [key: string]: JSX.Element;
  }

  const chartMap: IChartMap = {
    tvl: <TvlChart data={dataSeries.tvl} />,
    revs: <RevsChart data={dataSeries.revenues} />,
  };

  return (
    <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow mb-5">
      <h2 className="font-body font-bold text-xl p-4">
        {t(`v2.stats.platform.${chart}ChartTitle`)}
      </h2>
      <aside className="xl:h-[500px] sm:h-[400px] pr-4">{chartMap[chart]}</aside>
    </div>
  );
};

export default ChartContainer;
