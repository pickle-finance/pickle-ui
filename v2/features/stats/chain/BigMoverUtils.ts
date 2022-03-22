import { ChainData } from "v2/types";

export const getTokenPriceChangePct = (dataSeries: ChainData) => {
  const assetData = dataSeries ? dataSeries.assets : {};
  console.log("From MoverUtils:");
  const assetKeys = Object.keys(assetData ? assetData : {}); 
  const wowSummary: tokenPriceChangePct[] = []
  if (assetData) {  
    for (let i=0; i < assetKeys.length; i++) {
      let currentTokenPrice = assetData ? assetData[i].now.depositTokenPrice : 0;
      let previousTokenPrice = assetData ? assetData[i].previous.depositTokenPrice : 0;
      let tokenChange = {
        apiKey: assetKeys[i],
        tokenPriceChange: (currentTokenPrice - previousTokenPrice)/previousTokenPrice
      }
      wowSummary.push(tokenChange);
    }
  }
  console.log(wowSummary);
  return wowSummary;
};

export const getTokenPriceChangeBal = (dataSeries: ChainData) => {
  const assetData = dataSeries ? dataSeries.assets : {};
  console.log("From MoverUtils:");
  const assetKeys = Object.keys(assetData ? assetData : {}); 
  const wowSummary: tokenPriceChangePct[] = []
  if (assetData) {  
    for (let i=0; i < assetKeys.length; i++) {
      let currentTokenPrice = assetData ? assetData[i].now.depositTokenPrice : 0;
      let previousTokenPrice = assetData ? assetData[i].previous.depositTokenPrice : 0;
      let tokenChange = {
        apiKey: assetKeys[i],
        tokenPriceChange: (currentTokenPrice - previousTokenPrice)/previousTokenPrice
      }
      wowSummary.push(tokenChange);
    }
  }
  console.log(wowSummary);
  return wowSummary;
};

interface tokenPriceChangePct {
  apiKey: string;
  tokenPriceChange: number;
}