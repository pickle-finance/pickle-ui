import { PickleModelJson } from "picklefinance-core";
import { FC, useEffect, useState } from "react";
import { PlatformData, SetFunction } from "v2/types";
import ChainTableContainer from "./platform/ChainTableContainer";
import ChartContainer from "./shared/ChartContainer";
import { readyState } from "pages/stats";
import PlatformHeader from "./platform/PlatformHeader";

const PlatformStats: FC<{
  setChain: SetFunction;
  core: PickleModelJson.PickleModelJson | undefined;
  ready: readyState;
  setReady: SetFunction;
  page: "platform" | "chain" | "jar" | undefined;
}> = ({ setChain, core, ready, setReady, page }) => {
  const [dataSeries, setDataSeries] = useState<PlatformData>({} as PlatformData);
  useEffect(() => {
    const getData = async (): Promise<void> => {
      getPlatformData()
        .then((platformData) => setDataSeries(platformData))
        .then(() => setReady((prev: readyState) => ({ ...prev, platform: true })));
    };
    getData();
  }, []);

  if (page === "platform" && ready[page])
    return (
      <>
        <PlatformHeader core={core} />
        <div className="w-full columns-1 lg:columns-2 gap-5">
          <ChartContainer chart="tvl" dataSeries={dataSeries} />
          <ChartContainer chart="revs" dataSeries={dataSeries} />
        </div>
        <div className="w-full min-w-min grid grid-cols-1 xl:grid-cols-2 gap-5">
          <ChainTableContainer chains={dataSeries.chains} setChain={setChain} />
          <ChartContainer chart="topJars" core={core} />
        </div>
      </>
    );
  return null;
};

const getPlatformData = async (): Promise<PlatformData> => {
  // https://api.pickle.finance/prod/protocol/analytics/
  const url = `${process.env.apiPlatform}`;
  return await fetch(url)
    .then((response) => response.json())
    .catch((e) => console.log(e));
};

export default PlatformStats;
