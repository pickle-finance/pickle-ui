import { useEffect, useState } from "react";

import { JarWithAPY } from "./useJarsWithAPYEth";
import { getPoolData } from "../../util/api.js";

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
  const [jarsWithTVL, setJarsWithTVL] = useState<Array<JarWithTVL> | null>(
    null,
  );
  const [poolData, setPoolData] = useState<any | null>(null);

  const measureTVL = async () => {
    if (jars && poolData) {

      const newJars: JarWithTVL[] = jars.map((jar) => {
        const poolInfo = poolData.filter(
          (pool) =>
            pool.tokenAddress.toLowerCase() ===
            jar.depositToken.address.toLowerCase(),
        ); 
        return {
          ...jar,
          tvlUSD: poolInfo[0]?.liquidity_locked,
          usdPerPToken: (poolInfo[0]?.liquidity_locked * poolInfo[0]?.ratio)/ poolInfo[0]?.tokens,
          ratio: poolInfo[0]?.ratio,
        };
      });
      setJarsWithTVL(newJars);
    }
  };

  useEffect(() => {
    const fetchPoolData = async () => setPoolData(await getPoolData());
    if (!poolData) fetchPoolData();
    measureTVL();
  }, [jars]);

  return {
    jarsWithTVL,
  } as Output;
};
