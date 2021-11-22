import { useEffect, useState } from "react";

import { JarWithAPY } from "./useJarsWithAPYEth";
import { PoolData } from "./usePoolData";
import { CurvePairs } from "containers/CurvePairs";

export interface JarWithTVL extends JarWithAPY {
  tvlUSD: null | number;
  usdPerPToken: null | number;
  ratio: null | number;
}

type Input = Array<JarWithAPY> | null;
type Output = {
  jarsWithTVL: Array<JarWithTVL> | null;
};

export const useJarWithTVL = (jars: Input): Output => {
  const { poolData } = PoolData.useContainer();
  const { getCurveLpPriceData } = CurvePairs.useContainer();
  const [jarsWithTVL, setJarsWithTVL] = useState<Array<JarWithTVL> | null>(
    null,
  );

  const measureTVL = async () => {
    if (jars && poolData) {
      let newJars: JarWithTVL[] = jars.map((jar) => {
        const poolInfo = poolData.filter(
          (pool) =>
            pool.tokenAddress.toLowerCase() ===
            jar.depositToken.address.toLowerCase(),
        );
        const tvlUSD = poolInfo[0]?.liquidity_locked;
        return {
          ...jar,
          tvlUSD,
          usdPerPToken: (tvlUSD * poolInfo[0]?.ratio) / poolInfo[0]?.tokens,
          ratio: poolInfo[0]?.ratio,
        };
      });
      setJarsWithTVL(newJars);
    }
  };

  useEffect(() => {
    measureTVL();
  }, [jars, poolData?.length]);

  return {
    jarsWithTVL,
  } as Output;
};
