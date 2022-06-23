import React, { FC } from "react";
import TvlChart from "./TvlChart";
import RevsChart from "./RevsChart";
import TopJarsPieChart from "./TopJarsPieChart";
import { ChainData, PlatformData } from "v2/types";
import { useTranslation } from "next-i18next";
import { ChainNetwork, PickleModelJson } from "picklefinance-core";
import { classNames } from "v2/utils";

const ChartContainer: FC<{
  chart: "tvl" | "revs" | "topJars";
  dataSeries?: PlatformData | ChainData;
  core?: PickleModelJson.PickleModelJson;
  chain?: string;
  className?: string;
}> = ({ chart, dataSeries, core, chain, className }) => {
  const { t } = useTranslation("common");

  interface IChartMap {
    [key: string]: JSX.Element | undefined;
  }

  const chartMap: IChartMap = {
    tvl: dataSeries ? <TvlChart data={dataSeries.tvl} /> : undefined,
    revs: dataSeries ? <RevsChart data={dataSeries.revenues} /> : undefined,
    topJars: core ? <TopJarsPieChart core={core} chain={chain as ChainNetwork} /> : undefined,
  };

  if (chartMap[chart])
    return (
      <div
        className={classNames(
          "bg-background-light rounded-xl min-w-[500px] border border-foreground-alt-500 mb-5",
          className,
        )}
      >
        <h2 className="font-body font-bold text-xl text-foreground-alt-200 p-4">
          {t(`v2.stats.platform.${chart}ChartTitle`)}
        </h2>
        <aside className="xl:h-[500px] sm:h-[400px] pr-4">{chartMap[chart]}</aside>
      </div>
    );
  return null;
};

export default ChartContainer;
