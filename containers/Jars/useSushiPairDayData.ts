import { useEffect, useState } from "react";

import { Connection } from "../Connection";
import { JAR_DEPOSIT_TOKENS } from "./jars";
import { PICKLE_ETH_SLP } from "../Contracts";
import { NETWORK_NAMES } from "containers/config";

export interface UniLPAPY {
  pair: {
    id: string;
  };
  reserveUSD: number;
  volumeUSD: number;
}

const SUSHI_LP_TOKENS = [
  PICKLE_ETH_SLP,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_DAI,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_USDC,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_USDT,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_WBTC,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_YFI,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_YVECRV,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_YVBOOST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_ALCX,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_CVX_ETH,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_TRU_ETH,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SPELL_ETH,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].MIM_ETH,
];

const POLY_SUSHI_LP_TOKENS = [
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.POLY].POLY_SUSHI_ETH_USDT,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.POLY].POLY_SUSHI_MATIC_ETH,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.POLY].POLY_SUSHI_DINO_USDC,
];

const ARB_SUSHI_LP_TOKENS = [
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ARB].SUSHI_SPELL_ETH,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ARB].SUSHI_MIM_ETH,
];

const headers = {
  "User-Agent":
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.5",
  "Content-Type": "application/json",
};

export const useSushiPairDayData = () => {
  const { chainName } = Connection.useContainer();

  const [sushiPairDayData, setSushiPairDayData] = useState<Array<UniLPAPY>>([]);

  const queryTheGraph = () => {
    fetch("https://api.thegraph.com/subgraphs/name/sushiswap/exchange", {
      credentials: "omit",
      headers,
      referrer:
        "https://thegraph.com/explorer/subgraph/zippoxer/sushiswap-subgraph-fork",
      body: `{"query":"{\\n  pairDayDatas(first: ${
        SUSHI_LP_TOKENS.length
      }, skip: 1, orderBy: date, orderDirection: desc, where: {pair_in: [\\"${SUSHI_LP_TOKENS.join(
        '\\", \\"',
      ).toLowerCase()}\\"]}) {\\n    pair{ id }\\n    reserveUSD\\n    volumeUSD\\n  }\\n}\\n","variables":null}`,
      method: "POST",
      mode: "cors",
    })
      .then((res) => res.json())
      .then((data) => setSushiPairDayData(data.data?.pairDayDatas))
      .catch(() => setSushiPairDayData([]));
  };

  const queryTheGraphArb = () => {
    fetch(
      "https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange",
      {
        credentials: "omit",
        headers,
        referrer:
          "https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange",
        body: `{"query":"{\\n  pairDayDatas(first: ${
          ARB_SUSHI_LP_TOKENS.length
        }, skip: 1, orderBy: date, orderDirection: desc, where: {pair_in: [\\"${ARB_SUSHI_LP_TOKENS.join(
          '\\", \\"',
        ).toLowerCase()}\\"]}) {\\n    pair{ id }\\n    reserveUSD\\n    volumeUSD\\n  }\\n}\\n","variables":null}`,
        method: "POST",
        mode: "cors",
      },
    )
      .then((res) => res.json())
      .then((data) => setSushiPairDayData(data.data?.pairDayDatas))
      .catch(() => setSushiPairDayData([]));
  };

  const queryTheGraphPoly = () => {
    fetch("https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange", {
      credentials: "omit",
      headers,
      referrer:
        "https://thegraph.com/explorer/subgraph/sushiswap/matic-exchange",
      body: `{"query":"{\\n  pairDayDatas(first: ${
        POLY_SUSHI_LP_TOKENS.length
      }, skip: 1, orderBy: date, orderDirection: desc, where: {pair_in: [\\"${POLY_SUSHI_LP_TOKENS.join(
        '\\", \\"',
      ).toLowerCase()}\\"]}) {\\n    pair{ id }\\n    reserveUSD\\n    volumeUSD\\n  }\\n}\\n","variables":null}`,
      method: "POST",
      mode: "cors",
    })
      .then((res) => res.json())
      .then((data) => setSushiPairDayData(data.data?.pairDayDatas))
      .catch(() => setSushiPairDayData([]));
  };

  const getSushiPairDayAPY = (pair: string) => {
    if (sushiPairDayData) {
      const filteredPair = sushiPairDayData.filter((x) => {
        const pairAddress = x?.pair?.id;
        return pairAddress.toLowerCase() === pair.toLowerCase();
      });

      if (filteredPair.length > 0) {
        const selected = filteredPair[0];

        // 0.25% fee to LP
        const apy =
          (selected.volumeUSD / selected.reserveUSD) * 0.0025 * 365 * 100;

        return [{ lp: apy }];
      }
    }

    return [];
  };

  useEffect(() => {
    if (sushiPairDayData.length > 0) return;

    if (chainName === NETWORK_NAMES.POLY) {
      queryTheGraphPoly();
    } else if (chainName === NETWORK_NAMES.ARB) {
      queryTheGraphArb();
    } else {
      queryTheGraph();
    }
  });

  return {
    getSushiPairDayAPY,
    sushiPairDayData,
  };
};
