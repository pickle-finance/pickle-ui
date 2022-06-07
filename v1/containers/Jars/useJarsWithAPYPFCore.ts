import { useEffect, useState } from "react";
import { Jar } from "./useFetchJars";
import { PickleCore } from "./usePickleCore";
import { Prices } from "../Prices";

export interface JarApy {
  [k: string]: number;
}

const getCompoundingAPY = (apr: number) => {
  return 100 * (Math.pow(1 + apr / 365, 365) - 1);
};

export interface JarWithAPY extends Jar {
  totalAPY: number;
  apr: number;
  lp: number;
  APYs: Array<JarApy>;
}

type Input = Array<Jar> | null;
type Output = {
  jarsWithAPY: Array<JarWithAPY> | null;
};

export const useJarWithAPY = (network: string | null, jars: Input): Output => {
  const { pickleCore } = PickleCore.useContainer();
  const { prices } = Prices.useContainer();
  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(null);

  const calculateJarAPYs = (jar: Jar) => {
    if (pickleCore) {
      const aprStats = pickleCore.assets.jars.filter(
        (pFJar) => jar.apiKey === pFJar.details?.apiKey,
      )[0]?.aprStats;
      let lp = 0;
      if (aprStats) {
        const componentsAPYs: JarApy[] = aprStats.components.map((component) => {
          const apr = !isNaN(component.apr) ? +component.apr : 0; // protect against non-numeric values
          if (component.name.toLowerCase() === "lp") {
            lp = apr;
          }
          return {
            [component.name]: component.compoundable ? getCompoundingAPY(component.apr / 100) : apr,
          };
        });

        return {
          APYs: componentsAPYs,
          apr: aprStats ? aprStats.apr : 0,
          totalAPY: aprStats ? aprStats.apy : 0,
          lp: lp,
        };
      }
      return {
        APYs: [],
        apr: 0,
        totalAPY: 0,
        lp: 0,
      };
    }

    return [];
  };

  const calculateAPY = async () => {
    if (jars && pickleCore) {
      const results = jars.map((jar) => {
        interface JarData {
          APYs: JarApy[];
          apr: number;
          totalAPY: number;
          lp: number;
        }
        const jarData: JarData = <JarData>calculateJarAPYs(jar);

        return {
          ...jar,
          ...jarData,
        };
      });

      setJarsWithAPY(results);
    }
  };
  useEffect(() => {
    calculateAPY();
  }, [jars?.length, network, pickleCore, prices]);

  return { jarsWithAPY };
};
