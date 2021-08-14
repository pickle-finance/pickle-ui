import { useEffect, useState } from "react";

import { JarWithAPY } from "./useJarsWithAPYEth";
import { PICKLE_JARS } from "./jars";
import { PoolData } from "./usePoolData";

export interface JarWithTVL extends JarWithAPY {
  tvlUSD: null | number;
  usdPerPToken: null | number;
  ratio: null | number;
}

type Input = Array<JarWithAPY> | null;
type Output = {
  jarsWithTVL: Array<JarWithTVL> | null;
};

const isMStonksJar = (token: string) =>
  token === PICKLE_JARS.pUNIMTSLAUST.toLowerCase() ||
  token === PICKLE_JARS.pUNIMBABAUST.toLowerCase() ||
  token === PICKLE_JARS.pUNIMSLVUST.toLowerCase() ||
  token === PICKLE_JARS.pUNIMQQQUST.toLowerCase() ||
  token === PICKLE_JARS.pUNIMAAPLUST.toLowerCase();

export const useJarWithTVL = (jars: Input): Output => {
  const { poolData } = PoolData.useContainer();
  const [jarsWithTVL, setJarsWithTVL] = useState<Array<JarWithTVL> | null>(
    null,
  );

  const measureTVL = async () => {
    if (jars && poolData) {
      const newJars: JarWithTVL[] = jars.map((jar) => {
        const poolInfo = poolData.filter(
          (pool) =>
            pool.tokenAddress.toLowerCase() ===
            jar.depositToken.address.toLowerCase(),
        );
        const tvlUSD =
          poolInfo[0]?.liquidity_locked *
          (isMStonksJar(jar.contract.address.toLowerCase()) ? 2 : 1);
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
  }, [jars?.length, poolData.length]);

  return {
    jarsWithTVL,
  } as Output;
};
