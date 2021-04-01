import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";

const requestURL =
  "https://api.coingecko.com/api/v3/simple/price?ids=pickle-finance%2Cethereum%2Cdai%2Cusd-coin%2Ccompound-governance-token%2Ccurve-dao-token%2Ctether%2Cuniswap%2Chavven%2Cnusd%2Cwrapped-bitcoin%2Csushi%2Cyearn-finance%2Cbasis-share%2Cbasis-cash%2Cmithril-share%2Cmith-cash%2Clido-dao%2Cmirror-protocol%2Cterrausd%2Cmirrored-tesla%2Cmirrored-apple%2Cmirrored-invesco-qqq-trust%2Cmirrored-ishares-silver-trust%2Cmirrored-alibaba%2Cvecrv-dao-yvault&vs_currencies=usd";

type UsdPrice = { usd: number };

interface Response {
  dai: UsdPrice;
  ["compound-governance-token"]: UsdPrice;
  ethereum: UsdPrice;
  nusd: UsdPrice;
  "pickle-finance": UsdPrice;
  tether: UsdPrice;
  "usd-coin": UsdPrice;
  "curve-dao-token": UsdPrice;
  uniswap: UsdPrice;
  havven: UsdPrice;
  "wrapped-bitcoin": UsdPrice;
  sushi: UsdPrice;
  "yearn-finance": UsdPrice;
  "basis-share": UsdPrice;
  "basis-cash": UsdPrice;
  "mithril-share": UsdPrice;
  "mith-cash": UsdPrice;
  "lido-dao": UsdPrice;
  "vecrv-dao-yvault": UsdPrice;
  "mirror-protocol": UsdPrice;
  terrausd: UsdPrice;
  "mirrored-tesla": UsdPrice;
  "mirrored-apple": UsdPrice;
  "mirrored-invesco-qqq-trust": UsdPrice;
  "mirrored-ishares-silver-trust": UsdPrice;
  "mirrored-alibaba": UsdPrice;
}

interface PriceObject {
  dai: number;
  comp: number;
  eth: number;
  susd: number;
  pickle: number;
  usdt: number;
  usdc: number;
  crv: number;
  snx: number;
  uni: number;
  sushi: number;
  yfi: number;
  wbtc: number;
  bas: number;
  bac: number;
  mis: number;
  mic: number;
  ldo: number;
  yvecrv: number;
  mir: number;
  ust: number;
  mtsla: number;
  maapl: number;
  mqqq: number;
  mslv: number;
  mbaba: number;
}

export type PriceIds = keyof PriceObject;

function usePrices() {
  const [prices, setPrices] = useState<PriceObject | null>(null);

  const getPrices = async () => {
    const response: Response = await fetch(requestURL, {
      headers: {
        accept: "application/json",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
      referrer: "https://www.coingecko.com/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "omit",
    }).then((x) => x.json());

    const prices: PriceObject = {
      dai: response.dai.usd,
      comp: response["compound-governance-token"].usd,
      eth: response.ethereum.usd,
      susd: response.nusd.usd,
      pickle: response["pickle-finance"].usd,
      usdt: response.tether.usd,
      usdc: response["usd-coin"].usd,
      crv: response["curve-dao-token"].usd,
      snx: response["havven"].usd,
      uni: response["uniswap"].usd,
      sushi: response["sushi"].usd,
      yfi: response["yearn-finance"].usd,
      wbtc: response["wrapped-bitcoin"].usd,
      bas: response["basis-share"].usd,
      bac: response["basis-cash"].usd,
      mis: response["mithril-share"].usd,
      mic: response["mith-cash"].usd,
      ldo: response["lido-dao"].usd,
      yvecrv: response["vecrv-dao-yvault"].usd,
      mir: response["mirror-protocol"].usd,
      ust: response["terrausd"].usd,
      mtsla: response["mirrored-tesla"].usd,
      maapl: response["mirrored-apple"].usd,
      mqqq: response["mirrored-invesco-qqq-trust"].usd,
      mslv: response["mirrored-ishares-silver-trust"].usd,
      mbaba: response["mirrored-alibaba"].usd,
    };
    setPrices(prices);
  };

  useEffect(() => {
    getPrices();
    setInterval(() => getPrices(), 120000);
  }, []);

  return { prices };
}

export const Prices = createContainer(usePrices);
