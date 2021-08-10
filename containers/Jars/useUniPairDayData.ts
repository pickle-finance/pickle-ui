import { useEffect, useState } from "react";

import { Connection } from "../Connection";
import { JAR_DEPOSIT_TOKENS } from "./jars";
import { PICKLE_ETH_FARM } from "../Farms/farms";
import { NETWORK_NAMES } from "containers/config";

export interface UniLPAPY {
  pairAddress: string;
  reserveUSD: number;
  dailyVolumeUSD: number;
}

const UNI_LP_TOKENS = [
  PICKLE_ETH_FARM,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_ETH_DAI,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_ETH_USDC,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_ETH_USDT,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_ETH_WBTC,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MIR_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MTSLA_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MAAPL_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MQQQ_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MSLV_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MBABA_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_FEI_TRIBE,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_LUSD_ETH,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_FOX_ETH,
];

export const useUniPairDayData = () => {
  const { signer } = Connection.useContainer();

  const [uniPairDayData, setUniPairDayData] = useState<Array<UniLPAPY> | null>(
    null,
  );

  const queryTheGraph = async () => {
    const res = await fetch(
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
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
        body: `{"query":"{\\n  pairDayDatas(first: ${UNI_LP_TOKENS.length.toString()}, skip: 1, orderBy: date, orderDirection: desc, where: {pairAddress_in: [\\"${UNI_LP_TOKENS.join(
          '\\", \\"',
        )}\\"]}) {\\n    pairAddress\\n    reserveUSD\\n    dailyVolumeUSD\\n  }\\n}\\n","variables":null}`,
        method: "POST",
        mode: "cors",
      },
    ).then((x) => x.json());

    res?.data?.pairDayDatas && setUniPairDayData(res?.data?.pairDayDatas); // Sometimes the graph call fails
  };

  const getUniPairDayAPY = (pair: string) => {
    if (uniPairDayData) {
      const filteredPair = uniPairDayData.filter(
        (x) => x.pairAddress.toLowerCase() === pair.toLowerCase(),
      );

      if (filteredPair.length > 0) {
        const selected = filteredPair[0];

        // 0.3% fee to LP
        const apy =
          (selected.dailyVolumeUSD / selected.reserveUSD) * 0.003 * 365 * 100;

        return [{ lp: apy }];
      }
    }

    return [];
  };

  useEffect(() => {
    if (!uniPairDayData) queryTheGraph();
  }, []);

  return {
    getUniPairDayAPY,
  };
};
