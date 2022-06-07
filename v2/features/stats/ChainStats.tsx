import { FC, useEffect, useState } from "react";
import type { ChainData, SetFunction } from "v2/types";

import ChartContainer from "v2/features/stats/shared/ChartContainer";
import AssetTableContainer from "v2/features/stats/chain/AssetTableContainer";
import BigMoverTableContainer from "v2/features/stats/chain/BigMoverTableContainer";
import {
  getTokenPriceChangePct,
  getTVLChange,
  iBigMoverTableData,
} from "v2/features/stats/chain/BigMoverUtils";
import { ChainNetwork, PickleModelJson } from "picklefinance-core";
import { ChainSelectData } from "./ChainSelect";
import { JarSelectData } from "./JarSelect";

const ChainStats: FC<{
  core: PickleModelJson.PickleModelJson | undefined;
  chain: ChainSelectData;
  jar: JarSelectData;
  setJar: SetFunction;
}> = ({ core, chain, jar, setJar }) => {
  const [chainData, setChainData] = useState<ChainData>({} as ChainData);
  const [tokenPctChangeData, setTokenPctChangeData] = useState<iBigMoverTableData[]>([]);
  const [tvlChange, setTvlChange] = useState<iBigMoverTableData[]>([]);

  useEffect(() => {
    const getData = async (): Promise<void> => {
      if (chain)
        getChainData(chain.value).then((data) => {
          setChainData(data);
        });
    };
    getData();
  }, [chain]);

  useEffect(() => {
    const tokenPriceChangePct = getTokenPriceChangePct(chainData);
    setTokenPctChangeData(tokenPriceChangePct);
    const tvlChange = getTVLChange(chainData);
    setTvlChange(tvlChange);
  }, [chainData]);

  tokenPctChangeData.sort((a, b) => (a.tokenPriceChange || 0) - (b.tokenPriceChange || 0));
  tvlChange.sort((a, b) => (a.tvlChange || 0) - (b.tvlChange || 0));

  if (Object.keys(chain).length > 0 && Object.keys(jar).length === 0)
    return (
      <>
        <BigMoverTableContainer type="tvl" tableData={tvlChange} />
        <BigMoverTableContainer type="tokenPct" tableData={tokenPctChangeData} />
        <div className="w-full lg:columns-2 md:columns-1 gap-5">
          <ChartContainer chart="tvl" dataSeries={chainData} />
          <ChartContainer chart="revs" dataSeries={chainData} />
        </div>
        <div className="w-full min-w-min grid grid-cols-1 xl:grid-cols-2 gap-5">
          <AssetTableContainer chainData={chainData} core={core} chain={chain} setJar={setJar} />
          <ChartContainer chart="topJars" core={core} chain={chain.value} />
        </div>
      </>
    );
  return null;
};

const getChainData = async (chain: string): Promise<ChainData> => {
  // https://api.pickle.finance/prod/protocol/analytics/chain/{chain}/en
  const url = `${process.env.apiChain}/${chain}/en`;
  return await fetch(url)
    .then((response) => response.json())
    .catch((e) => console.log(e));
};

export default ChainStats;
