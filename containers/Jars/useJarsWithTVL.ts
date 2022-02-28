import { useEffect, useState } from "react";

import { JarWithAPY } from "./useJarsWithAPYPFCore";
import { PoolData } from "./usePoolData";
import { CurvePairs } from "containers/CurvePairs";

export interface JarWithTVL extends JarWithAPY {}

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
        return {
          ...jar,
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
