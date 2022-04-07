import { ChainData } from "v2/types";

export const getTokenPriceChangePct = (dataSeries: ChainData) => {
  const assetData = dataSeries ? dataSeries.assets : {};
  const assetKeys = Object.keys(assetData ? assetData : {}); 
  console.log(assetKeys);
  const wowSummary: tokenPriceChangePct[] = []
  if (assetData) {  
    for (let i=0; i < assetKeys.length; i++) {
      console.log(assetData[i]);
      let currentTokenPrice = assetData && assetData[assetKeys[i]]?.now ? assetData[assetKeys[i]]?.now.depositTokenPrice : 0;
      let previousTokenPrice = assetData && assetData[assetKeys[i]]?.previous ? assetData[assetKeys[i]]?.previous.depositTokenPrice : 0;
      let tokenChange = {
        apiKey: assetKeys[i],
        tokenPriceChange: (currentTokenPrice - previousTokenPrice)/previousTokenPrice
      }
      wowSummary.push(tokenChange);
    }
  }
  return wowSummary;
};

export const getTokenPriceChangeBal = (dataSeries: ChainData) => {
  const assetData = dataSeries ? dataSeries.assets : {};
  const assetKeys = Object.keys(assetData ? assetData : {}); 
  const wowSummary: tokenPriceChangePct[] = []
  if (assetData) {  
    for (let i=0; i < assetKeys.length; i++) {
      let currentTokenPrice = assetData && assetData[assetKeys[i]] && assetData[assetKeys[i]]?.now ? assetData[assetKeys[i]].now.depositTokenPrice : 0;
      let previousTokenPrice = assetData && assetData[assetKeys[i]] && assetData[assetKeys[i]].previous ? assetData[assetKeys[i]].previous.depositTokenPrice : 0;
      let tokenChange = {
        apiKey: assetKeys[i],
        tokenPriceChange: (currentTokenPrice - previousTokenPrice)/previousTokenPrice
      }
      wowSummary.push(tokenChange);
    }
  }
  return wowSummary;
};

interface tokenPriceChangePct {
  apiKey: string;
  tokenPriceChange: number;
}