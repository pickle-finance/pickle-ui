import { useEffect, useState } from "react";
import { Jar } from "./useFetchJars";
import { NETWORK_NAMES, ChainName } from "containers/config";
import { PickleCore } from "./usePickleCore";

export interface JarApy {
  [k: string]: number;
}

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

const getCompoundingAPY = (apr: number) => {
  return 100 * (Math.pow(1 + apr / 365, 365) - 1);
};

export const useJarWithAPY = (network: ChainName, jars: Input): Output => {
  const { pickleCore } = PickleCore.useContainer();
  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );

  const calculateJarAPYs = (jarWantAddr: string) => {
    if (pickleCore) {
      const aprStats = pickleCore.assets.jars.filter(
        (jar) =>
          jarWantAddr.toLowerCase() === jar.depositToken.addr.toLowerCase(),
      )[0].aprStats!;
      let lp = 0;
      const componentsAPYs: JarApy[] = aprStats?.components.map((component) => {
        const apr = !isNaN(component.apr)? +component.apr: 0  // protect against non-numeric values
        if (component.name.toLowerCase() === "lp") {
          lp = apr;
        }
        return {
          [component.name]: component.compoundable
            ? getCompoundingAPY(apr / 100)
            : apr,
        };
      });

      return {
        APYs: componentsAPYs,
        apr: aprStats ? aprStats.apr : 0,
        totalAPY: aprStats ? aprStats.apy : 0,
        lp: lp,
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

        const jarData: JarData = <JarData>(
          calculateJarAPYs(jar.contract.address)
        );

        return {
          ...jar,
          ...jarData,
        };
      });

      setJarsWithAPY(results);
    }
  };

  useEffect(() => {
    if (network === NETWORK_NAMES.POLY) calculateAPY();
  }, [jars?.length, pickleCore, network]);

  return { jarsWithAPY };
};
