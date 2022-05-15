import { ChainData } from "v2/types";

export const getTokenPriceChangePct = (dataSeries: ChainData): iBigMoverTableData[] => {
  const assetData = dataSeries ? dataSeries.assets : {};
  const assetKeys = Object.keys(assetData ? assetData : {});
  let wowSummary: iBigMoverTableData[] = [];
  if (assetData) {
    for (let i = 0; i < assetKeys.length; i++) {
      let currentTokenPrice =
        assetData && assetData[assetKeys[i]]?.now
          ? assetData[assetKeys[i]]?.now.depositTokenPrice
          : 0;
      let previousTokenPrice =
        assetData && assetData[assetKeys[i]]?.previous
          ? assetData[assetKeys[i]]?.previous.depositTokenPrice
          : 0;
      let tokenChange = {
        apiKey: assetKeys[i],
        tokenPriceChange: previousTokenPrice
          ? (currentTokenPrice - previousTokenPrice) / previousTokenPrice
          : 0,
      };
      wowSummary.push(tokenChange);
    }
  }
  return wowSummary;
};

export const getTVLChange = (dataSeries: ChainData): iBigMoverTableData[] => {
  const assetData = dataSeries ? dataSeries.assets : {};
  const assetKeys = Object.keys(assetData ? assetData : {});
  let wowSummary: iBigMoverTableData[] = [];
  if (assetData) {
    for (let i = 0; i < assetKeys.length; i++) {
      let tvlNow =
        assetData && assetData[assetKeys[i]]?.now ? assetData[assetKeys[i]]?.now.value : 0;
      let tvlPrevious =
        assetData && assetData[assetKeys[i]]?.previous
          ? assetData[assetKeys[i]]?.previous.value
          : 0;
      let tvlChange = {
        apiKey: assetKeys[i],
        tvlChange: tvlNow - tvlPrevious,
      };
      wowSummary.push(tvlChange);
    }
  }
  return wowSummary;
};

export interface iBigMoverTableData {
  apiKey: string;
  tokenPriceChange?: number;
  tvlChange?: number;
}
