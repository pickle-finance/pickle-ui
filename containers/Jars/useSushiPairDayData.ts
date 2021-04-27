import { useEffect, useState } from "react";

import { Connection } from "../Connection";
import { JAR_DEPOSIT_TOKENS } from "./jars";

export interface UniLPAPY {
  pairAddress: string;
  reserveUSD: number;
  dailyVolumeUSD: number;
}

const SUSHI_LP_TOKENS = [
  JAR_DEPOSIT_TOKENS.SUSHI_ETH_DAI,
  JAR_DEPOSIT_TOKENS.SUSHI_ETH_USDC,
  JAR_DEPOSIT_TOKENS.SUSHI_ETH_USDT,
  JAR_DEPOSIT_TOKENS.SUSHI_ETH_WBTC,
  JAR_DEPOSIT_TOKENS.SUSHI_ETH_YFI,
  JAR_DEPOSIT_TOKENS.SUSHI_MIC_USDT,
  JAR_DEPOSIT_TOKENS.SUSHI_MIS_USDT,
  JAR_DEPOSIT_TOKENS.SUSHI_ETH_YVECRV,
  JAR_DEPOSIT_TOKENS.SUSHI_ETH,
  JAR_DEPOSIT_TOKENS.SUSHI_ETH_ALCX
];

export const useSushiPairDayData = () => {
  const { signer } = Connection.useContainer();

  const [sushiPairDayData, setSushiPairDayData] = useState<Array<
    UniLPAPY
  > | null>(null);

  const queryTheGraph = async () => {
    const res = await fetch(
      "https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork",
      {
        credentials: "omit",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/json",
        },
        referrer:
          "https://thegraph.com/explorer/subgraph/zippoxer/sushiswap-subgraph-fork",
        body: `{"query":"{\\n  pairDayDatas(first: ${SUSHI_LP_TOKENS.length}, skip: 1, orderBy: date, orderDirection: desc, where: {pairAddress_in: [\\"${SUSHI_LP_TOKENS.join(
          '\\", \\"',
        )}\\"]}) {\\n    pairAddress\\n    reserveUSD\\n    dailyVolumeUSD\\n  }\\n}\\n","variables":null}`,
        method: "POST",
        mode: "cors",
      },
    ).then((x) => x.json());

    setSushiPairDayData(res?.data?.pairDayDatas);
  };

  const getSushiPairDayAPY = (pair: string) => {
    if (sushiPairDayData) {
      const filteredPair = sushiPairDayData.filter(
        (x) => x.pairAddress.toLowerCase() === pair.toLowerCase(),
      );

      if (filteredPair.length > 0) {
        const selected = filteredPair[0];

        // 0.25% fee to LP
        const apy =
          (selected.dailyVolumeUSD / selected.reserveUSD) * 0.0025 * 365 * 100;

        return [{ lp: apy }];
      }
    }

    return [];
  };

  useEffect(() => {
    queryTheGraph();
  }, [signer]);

  return {
    getSushiPairDayAPY,
  };
};
