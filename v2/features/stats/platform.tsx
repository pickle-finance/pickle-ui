import { FC, useEffect, useState } from "react";
import { PlatformData } from "v2/types";
import { ChainSelectData } from "./ChainSelect";
import { JarSelectData } from "./JarSelect";
import ChainTableContainer from "./platform/ChainTableContainer";
import ChartContainer from "./shared/ChartContainer";

const PlatformStats: FC<{
  chain: ChainSelectData;
  jar: JarSelectData;
}> = ({ chain, jar }) => {
  const [dataSeries, setDataSeries] = useState<PlatformData>({} as PlatformData);
  useEffect(() => {
    const getData = async (): Promise<void> => {
      getPlatformData().then((platformData) => setDataSeries(platformData));
    };
    getData();
  }, []);

  if (Object.keys(chain).length === 0 && Object.keys(jar).length === 0)
    return (
      <>
        <div className="w-full lg:columns-2 md:columns-1 gap-5">
          <ChartContainer chart="tvl" dataSeries={dataSeries} />
          <ChartContainer chart="revs" dataSeries={dataSeries} />
        </div>
        <ChainTableContainer chains={dataSeries.chains} />
      </>
    );
  return <></>;
};

const getPlatformData = async (): Promise<PlatformData> => {
  // https://api.pickle.finance/prod/protocol/analytics/
  const url = `${process.env.apiPlatform}`;
  return await fetch(url).then((response) => response.json());
};

export default PlatformStats;
