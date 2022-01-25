import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { Connection } from "./Connection";
import CoinGecko from "coingecko-api";
import { ChainNetwork } from "picklefinance-core";

interface PriceObject {
  dai: number;
  comp: number;
  eth: number;
  susd: number;
  pickle: number;
  usdt: number;
  usdc: number;
  crv: number;
  cvxcrv: number;
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
  fei: number;
  tribe: number;
  lusd: number;
  frax: number;
  lqty: number;
  must: number;
  matic: number;
  yvboost: number;
  alcx: number;
  fxs: number;
  luna: number;
  mimatic: number;
  qi: number;
  cvx: number;
  ice: number;
  mim: number;
  spell: number;
  fox: number;
  dino: number;
  cherry: number;
  wokt: number;
  ethk: number;
  btck: number;
  tru: number;
  bxh: number;
  bal: number;
  rly: number;
  hnd: number;
  dodo: number;
  work: number;
  jswap: number;
  movr: number;
  solar: number;
}

export type PriceIds = keyof PriceObject;

interface CMCResponse {
  data?: {
    [id: string]: {
      quote: {
        USD: {
          price: number;
        };
      };
    };
  };
}

const jswapPrice = async (isOEC: boolean): Promise<number> => {
  if (!isOEC) return 0;

  const cmcRequest = `https://api.allorigins.win/get?url=${encodeURIComponent(
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=2ba4867e-b50f-44d7-806d-c0c5fde1a8db&slug=jswap-finance",
  )}`;
  const data = await fetch(cmcRequest).then((body) => body.json());

  const cmcData: CMCResponse = JSON.parse(data.contents);

  if (!cmcData.data) return 0;

  return cmcData?.data[Object.keys(cmcData.data)[0]].quote.USD.price;
};

function usePrices() {
  const [prices, setPrices] = useState<PriceObject | null>(null);
  const { chainName } = Connection.useContainer();
  const isOK = chainName === ChainNetwork.OKEx;

  const getPrices = async () => {
    if (!chainName) return;
    const CoinGeckoClient = new CoinGecko();
    const { data: response } = await CoinGeckoClient.simple.price({
      ids: [
        "pickle-finance",
        "ethereum",
        "dai",
        "usd-coin",
        "compound-governance-token",
        "curve-dao-token",
        "convex-crv",
        "tether",
        "uniswap",
        "havven",
        "nusd",
        "wrapped-bitcoin",
        "sushi",
        "yearn-finance",
        "basis-share",
        "basis-cash",
        "mithril-share",
        "mith-cash",
        "lido-dao",
        "mirror-protocol",
        "terrausd",
        "mirrored-tesla",
        "mirrored-apple",
        "mirrored-invesco-qqq-trust",
        "mirrored-ishares-silver-trust",
        "mirrored-alibaba",
        "vecrv-dao-yvault",
        "fei-usd",
        "tribe-2",
        "liquity-usd",
        "liquity",
        "frax",
        "frax-share",
        "must",
        "matic-network",
        "magic-internet-money",
        "spell-token",
        // "yvboost",
        "alchemix",
        "terra-luna",
        "mimatic",
        "qi-dao",
        "convex-finance",
        "iron-finance",
        "shapeshift-fox-token",
        "dinoswap",
        "cherryswap",
        "oec-token",
        "truefi",
        "bxh",
        "balancer",
        "rally-2",
        "hundred-finance",
        "dodo",
        "the-employment-commons-work-token",
        "moonriver",
        "solarbeam",
      ],
      vs_currencies: ["usd"],
    });

    const prices: PriceObject = {
      dai: response.dai.usd,
      comp: response["compound-governance-token"].usd,
      eth: response.ethereum.usd,
      susd: response.nusd.usd,
      pickle: response["pickle-finance"].usd,
      usdt: response.tether.usd,
      usdc: response["usd-coin"].usd,
      crv: response["curve-dao-token"].usd,
      cvxcrv: response["convex-crv"].usd,
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
      fei: response["fei-usd"].usd,
      tribe: response["tribe-2"].usd,
      lusd: response["liquity-usd"].usd,
      lqty: response["liquity"].usd,
      frax: response["frax"].usd,
      fxs: response["frax-share"].usd,
      must: response["must"].usd,
      matic: response["matic-network"].usd,
      yvboost: 0, // to update once CG provides yvboost price
      alcx: response["alchemix"].usd,
      luna: response["terra-luna"].usd,
      mimatic: response["mimatic"].usd,
      qi: response["qi-dao"].usd,
      cvx: response["convex-finance"].usd,
      ice: response["iron-finance"].usd,
      spell: response["spell-token"].usd,
      mim: response["magic-internet-money"].usd,
      fox: response["shapeshift-fox-token"].usd,
      dino: response["dinoswap"].usd,
      cherry: response["cherryswap"].usd,
      wokt: response["oec-token"].usd,
      ethk: response.ethereum.usd,
      btck: response["wrapped-bitcoin"].usd,
      tru: response["truefi"].usd,
      bxh: response["bxh"].usd,
      bal: response["balancer"].usd,
      rly: response["rally-2"].usd,
      hnd: response["hundred-finance"].usd,
      dodo: response["dodo"].usd,
      work: response["the-employment-commons-work-token"].usd,
      movr: response["moonriver"].usd,
      solar: response["solarbeam"].usd,
      jswap: await jswapPrice(isOK),
    };
    setPrices(prices);
  };

  useEffect(() => {
    getPrices();
    setInterval(() => getPrices(), 120000);
  }, [chainName]);

  return { prices };
}

export const Prices = createContainer(usePrices);
