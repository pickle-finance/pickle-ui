import { useEffect, useState } from "react";
import { Jar } from "./useFetchJars";
import { ChainName } from "containers/config";
import { PickleCore } from "./usePickleCore";

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

export const useJarWithAPY = (network: ChainName, jars: Input): Output => {
  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );
  const { pickleCore } = PickleCore.useContainer();

  const calculateJarAPYs = (jarName: string) => {
    if (pickleCore) {
      const aprStats = pickleCore.assets.jars.filter(
        (jar) => jarName.toLowerCase() === jar.depositToken.addr.toLowerCase(),
      )[0].aprStats!;
      let lp = 0;
      if (aprStats !== undefined) {
        const componentsAPYs: JarApy[] = aprStats.components.map((component) => {
          if (component.name.toLowerCase() === "lp") {
            lp = component.apr;
          }
          return {
            [component.name]: component.compoundable
              ? getCompoundingAPY(component.apr / 100)
              : component.apr,
          };
        });

        return {
          APYs: componentsAPYs,
          apr: aprStats.apr,
          totalAPY: aprStats.apy,
          lp: lp,
        };
      }
    }

    return [];
  };

  const calculateAPY = async () => {
    if (jars && pickleCore) {
      const promises = jars.map((jar) => {
        interface JarData {
          APYs: JarApy[];
          apr: number;
          totalAPY: number;
          lp: number;
        }
        const jarData: JarData = <JarData>(
          calculateJarAPYs(jar.depositToken.address)
        );

        return {
          ...jar,
          ...jarData,
        };
      });

      setJarsWithAPY(promises);
    }
  };
  useEffect(() => {
    calculateAPY();
  }, [jars?.length, network, pickleCore]);

  return { jarsWithAPY };
};
