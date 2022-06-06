import React, { FC } from "react";
import TvlChart from "./TvlChart";
import RevsChart from "./RevsChart";
import TopJarsPieChart from "./TopJarsPieChart";
import { ChainData, PlatformData } from "v2/types";
import { useTranslation } from "next-i18next";
import { PickleModelJson } from "picklefinance-core";

const ChartContainer: FC<{
  chart: "tvl" | "revs" | "topJars";
  dataSeries?: PlatformData | ChainData;
  core?: PickleModelJson.PickleModelJson | undefined;
}> = ({ chart, dataSeries, core }) => {
  const { t } = useTranslation("common");

  interface IChartMap {
    [key: string]: JSX.Element | null;
  }

  const chartMap: IChartMap = {
    tvl: dataSeries ? <TvlChart data={dataSeries.tvl} /> : null,
    revs: dataSeries ? <RevsChart data={dataSeries.revenues} /> : null,
    topJars: core ? <TopJarsPieChart core={core} /> : null,
  };

  if (chartMap[chart])
    return (
      <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow mb-5">
        <h2 className="font-body font-bold text-xl p-4">
          {t(`v2.stats.platform.${chart}ChartTitle`)}
        </h2>
        <aside className="xl:h-[500px] sm:h-[400px] pr-4">{chartMap[chart]}</aside>
      </div>
    );
  return null;
};

export default ChartContainer;
