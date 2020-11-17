import { useEffect, useState } from "react";

import { Prices } from "../Prices";

const curveAPYsURL = "https://www.curve.fi/raw-stats/apys.json";

export interface RawStatAPYs {
  compound: number;
  usdt: number;
  y: number;
  busd: number;
  susd: number;
  pax: number;
  ren2: number;
  rens: number;
  hbtc: number;
  ["3pool"]: number;
  gusd: number;
  husd: number;
  usdn: number;
  usdk: number;
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
