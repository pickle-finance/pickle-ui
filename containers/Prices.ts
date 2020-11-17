import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";

const requestURL =
  "https://api.coingecko.com/api/v3/simple/price?ids=pickle-finance%2Cethereum%2Cdai%2Cusd-coin%2Ccompound-governance-token%2Ccurve-dao-token%2Ctether%2Cuniswap%2Chavven%2Cnusd%2Cwrapped-bitcoin&vs_currencies=usd";

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
  wbtc: number;
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
      wbtc: response["wrapped-bitcoin"].usd,
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
