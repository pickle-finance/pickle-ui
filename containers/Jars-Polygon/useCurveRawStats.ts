import { useEffect, useState } from "react";

import { Prices } from "../Prices";

const curveAPYsURL = "https://stats.curve.fi/raw-stats-polygon/apys.json";

export interface RawStatAPYs {
  aave: number;
}

export const useCurveRawStats = (): { rawStats: null | RawStatAPYs } => {
  const { prices } = Prices.useContainer();

  const [rawStats, setRawStats] = useState<RawStatAPYs | null>(null);

  const getLPAPY = async () => {
    const res = await fetch(curveAPYsURL).then((x) => x.json());
    const stats = res.apy.day;

    for (const k of Object.keys(stats)) {
      stats[k] = stats[k] * 100;
    }

    setRawStats(stats);
  };

  useEffect(() => {
    getLPAPY();
  }, [prices]);

  return {
    rawStats,
  };
};
