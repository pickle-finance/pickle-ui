import { useEffect, useState } from "react";
import { NETWORK_NAMES } from "containers/config";

import { JAR_DEPOSIT_TOKENS } from "./jars";

export interface UniLPAPY {
  pairAddress: string;
  reserveUSD: number;
  dailyVolumeUSD: number;
}

const COMETH_LP_TOKENS = [
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.POLY].COMETH_USDC_WETH,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.POLY].COMETH_PICKLE_MUST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.POLY].COMETH_MATIC_MUST, 
];

export const useComethPairDayData = () => {
  const [uniPairDayData, setUniPairDayData] = useState<Array<UniLPAPY> | null>(
    null,
  );

  const queryTheGraph = async () => {
    const res = await fetch(
      "https://api.thegraph.com/subgraphs/name/cometh-game/comethswap",
      {
        credentials: "omit",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/json",
        },
        referrer: "https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2",
        body: `{"query":"{\\n  pairDayDatas(first: ${COMETH_LP_TOKENS.length.toString()}, skip: 1, orderBy: date, orderDirection: desc, where: {pairAddress_in: [\\"${COMETH_LP_TOKENS.join(
          '\\", \\"',
        )}\\"]}) {\\n    pairAddress\\n    reserveUSD\\n    dailyVolumeUSD\\n  }\\n}\\n","variables":null}`,
        method: "POST",
        mode: "cors",
      },
    ).then((x) => x.json());

    res?.data?.pairDayDatas && setUniPairDayData(res?.data?.pairDayDatas); // Sometimes the graph call fails
  };

  const getComethPairDayAPY = (pair: string) => {
    if (uniPairDayData) {
      const filteredPair = uniPairDayData.filter(
        (x) => x.pairAddress.toLowerCase() === pair.toLowerCase(),
      );

      if (filteredPair.length > 0) {
        const selected = filteredPair[0];

        // 0.5% fee to LP
        const apy =
          (selected.dailyVolumeUSD / selected.reserveUSD) * 0.005 * 365 * 100;

        return [{ lp: apy }];
      }
    }

    return [];
  };

  useEffect(() => {
    queryTheGraph();
  }, []);

  return {
    getComethPairDayAPY,
  };
};
