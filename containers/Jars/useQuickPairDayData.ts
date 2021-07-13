import { useEffect, useState } from "react";
import { NETWORK_NAMES } from "containers/config";

import { JAR_DEPOSIT_TOKENS } from "./jars";

export interface UniLPAPY {
  pairAddress: string;
  reserveUSD: number;
  dailyVolumeUSD: number;
}

const QUICK_LP_TOKENS = [
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.POLY].QUICK_MIMATIC_USDC,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.POLY].QUICK_MIMATIC_QI
];

export const useQuickPairDayData = () => {
  const [uniPairDayData, setUniPairDayData] = useState<Array<UniLPAPY> | null>(
    null,
  );

  const queryTheGraph = async () => {
    const res = await fetch(
      "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap07",
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
        body: `{"query":"{\\n  pairDayDatas(first: ${QUICK_LP_TOKENS.length.toString()}, skip: 1, orderBy: date, orderDirection: desc, where: {pairAddress_in: [\\"${QUICK_LP_TOKENS.join(
          '\\", \\"',
        )}\\"]}) {\\n    pairAddress\\n    reserveUSD\\n    dailyVolumeUSD\\n  }\\n}\\n","variables":null}`,
        method: "POST",
        mode: "cors",
      },
    ).then((x) => x.json());

    res?.data?.pairDayDatas && setUniPairDayData(res?.data?.pairDayDatas); // Sometimes the graph call fails
  };

  const getQuickPairDayAPY = (pair: string) => {
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
    getQuickPairDayAPY,
  };
};
