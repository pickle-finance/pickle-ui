import { FC, useEffect, useState } from "react";
import type { ChainData } from "v2/types";

import ChartContainer from "v2/features/stats/shared/ChartContainer";
import AssetTableContainer from "v2/features/stats/chain/AssetTableContainer";
import BigMoverTableContainer from "v2/features/stats/chain/BigMoverTableContainer";
import {
  getTokenPriceChangePct,
  getTVLChange,
  iBigMoverTableData,
} from "v2/features/stats/chain/BigMoverUtils";
import LoadingIndicator from "v2/components/LoadingIndicator";
import { PickleModelJson } from "picklefinance-core";

const ChainStats: FC<{ core: PickleModelJson.PickleModelJson | undefined; chain: string }> = ({
  core,
  chain,
}) => {
  const [chainData, setChainData] = useState<ChainData>({} as ChainData);
  const [tokenPctChangeData, setTokenPctChangeData] = useState<iBigMoverTableData[]>([]);
  const [tvlChange, setTvlChange] = useState<iBigMoverTableData[]>([]);

  useEffect(() => {
    const getData = async (): Promise<void> => {
      if (chain)
        getChainData(chain).then((data) => {
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

  return (
    <>
      {tvlChange.length > 0 && tokenPctChangeData.length > 0 && (
        <>
          <BigMoverTableContainer type="tvl" tableData={tvlChange} />
          <BigMoverTableContainer type="tokenPct" tableData={tokenPctChangeData} />
        </>
      )}
      {chainData.assets && core ? (
        <>
          <div className="w-full lg:columns-2 md:columns-1 gap-5">
            <ChartContainer chart="tvl" dataSeries={chainData} />
            <ChartContainer chart="revs" dataSeries={chainData} />
          </div>
          <AssetTableContainer assets={chainData?.assets} core={core} />
        </>
      ) : (
        <LoadingIndicator />
      )}
    </>
  );
};

const getChainData = async (chain: string): Promise<ChainData> => {
  // https://api.pickle.finance/prod/protocol/analytics/chain/{chain}/en
  const url = `${process.env.apiChain}/${chain}/en`;
  return await fetch(url)
    .then((response) => response.json())
    .catch((e) => console.log(e));
};

export default ChainStats;
