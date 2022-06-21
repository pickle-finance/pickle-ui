import { PickleModelJson } from "picklefinance-core";
import { FC, useEffect, useState } from "react";
import { PlatformData, SetFunction } from "v2/types";
import { ChainSelectData } from "./ChainSelect";
import { JarSelectData } from "./JarSelect";
import ChainTableContainer from "./platform/ChainTableContainer";
import ChartContainer from "./shared/ChartContainer";
import * as Sentry from "@sentry/nextjs";

const PlatformStats: FC<{
  chain: ChainSelectData;
  setChain: SetFunction;
  jar: JarSelectData;
  core: PickleModelJson.PickleModelJson | undefined;
}> = ({ chain, setChain, jar, core }) => {
  const [dataSeries, setDataSeries] = useState<PlatformData>({} as PlatformData);
  useEffect(() => {
    const getData = async (): Promise<void> => {
      getPlatformData().then((platformData) => setDataSeries(platformData));
    };
    getData();
  }, []);

  if (Object.keys(chain).length === 0 && Object.keys(jar).length === 0)
    if (Object.keys(dataSeries).length > 0)
      return (
        <>
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
  try {
    throw "error";
  } catch (err) {
    console.log("----------------------------------- ERROR -----------------------------------");
    console.log(err);
    Sentry.captureException(err);
  }
  return null;
};

const getPlatformData = async (): Promise<PlatformData> => {
  // https://api.pickle.finance/prod/protocol/analytics/
  const url = `${process.env.apiPlatform}`;
  return await fetch(url).then((response) => response.json());
};

export default PlatformStats;
