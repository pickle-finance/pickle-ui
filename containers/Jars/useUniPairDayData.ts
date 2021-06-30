import { useEffect, useState } from "react";
import { Record, Response } from "pages/api/uniswap-v2";

export const useUniPairDayData = () => {
  const [uniPairDayData, setUniPairDayData] = useState<Record[]>([]);

  const queryTheGraph = async () => {
    const res: Response = await fetch("/api/uniswap-v2").then((x) => x.json());

    res?.data?.pairDayDatas && setUniPairDayData(res?.data?.pairDayDatas); // Sometimes the graph call fails
  };

  const getUniPairDayAPY = (pair: string) => {
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

    return [];
  };

  useEffect(() => {
    queryTheGraph();
  }, []);

  return {
    getUniPairDayAPY,
  };
};
