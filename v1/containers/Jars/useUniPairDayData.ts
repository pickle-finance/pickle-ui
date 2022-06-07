import { useEffect, useState } from "react";
import { PickleCore } from "./usePickleCore";

export interface UniLPAPY {
  pairAddress: string;
  reserveUSD: number;
  dailyVolumeUSD: number;
}

export const useUniPairDayData = () => {
  const [uniPairDayData, setUniPairDayData] = useState<Array<UniLPAPY> | null>(null);
  const [uniLpTokens, setUniLpTokens] = useState<Array<string>>();
  const { pickleCore } = PickleCore.useContainer();

  const fillUniLpTokens = () => {
    const eth: string[] = [];
    pickleCore?.assets.jars.forEach((x) => {
      if (x.protocol === "uniswap") {
        eth.push(x.depositToken.addr);
      }
    });
    pickleCore?.assets.standaloneFarms.forEach((x) => {
      if (x.protocol === "uniswap") {
        eth.push(x.depositToken.addr);
      }
    });

    // This is currently useless
    pickleCore?.assets.external.forEach((x) => {
      if (x.protocol === "uniswap") {
        eth.push(x.depositToken.addr);
      }
    });

    setUniLpTokens(eth);
  };

  const queryTheGraph = async () => {
    const res = await fetch("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2", {
      credentials: "omit",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
      },
      referrer: "https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2",
      body: `{"query":"{\\n  pairDayDatas(first: ${uniLpTokens?.length.toString()}, skip: 1, orderBy: date, orderDirection: desc, where: {pairAddress_in: [\\"${uniLpTokens
        ?.join('\\", \\"')
        .toLowerCase()}\\"]}) {\\n    pairAddress\\n    reserveUSD\\n    dailyVolumeUSD\\n  }\\n}\\n","variables":null}`,
      method: "POST",
      mode: "cors",
    }).then((x) => x.json());

    res?.data?.pairDayDatas && setUniPairDayData(res?.data?.pairDayDatas); // Sometimes the graph call fails
  };

  const getUniPairDayAPY = (pair: string) => {
    if (uniPairDayData) {
      const pairData = uniPairDayData.find(
        (x) => x.pairAddress.toLowerCase() === pair.toLowerCase(),
      );

      if (pairData) {
        // 0.3% fee to LP
        const apy = (pairData.dailyVolumeUSD / pairData.reserveUSD) * 0.003 * 365 * 100;

        return [{ lp: apy }];
      }
    }

    return [];
  };

  useEffect(() => {
    if (uniPairDayData) return;

    if (!uniLpTokens) {
      fillUniLpTokens();
    }

    if (uniLpTokens) {
      queryTheGraph();
    }
  }, []);

  return {
    getUniPairDayAPY,
    uniPairDayData,
  };
};
