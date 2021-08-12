import { useEffect, useState } from "react";
import {
  DEPOSIT_TOKENS_JAR_NAMES,
  getPriceId,
  JAR_DEPOSIT_TOKENS,
  PICKLE_JARS,
} from "./jars";
import { Prices } from "../Prices";
import { Contracts } from "../Contracts";
import { Jar } from "./useFetchJars";
import { NETWORK_NAMES, ChainName } from "containers/config";
import { Connection } from "../Connection";
import { Contract as MulticallContract } from "ethers-multicall";

export interface JarApy {
  [k: string]: number;
}

interface PoolId {
  [key: string]: number;
}

const cherryPoolIds: PoolId = {
  "0x8E68C0216562BCEA5523b27ec6B9B6e1cCcBbf88": 1,
};

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
  const { multicallProvider, provider } = Connection.useContainer();
  const { cherrychef } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );

  const calculateCherryAPY = async (lpTokenAddress: string) => {
    if (cherrychef && multicallProvider) {
      const poolId = cherryPoolIds[lpTokenAddress];
      const multicallCherrychef = new MulticallContract(
        cherrychef.address,
        cherrychef.interface.fragments,
      );
    }
  };

  const calculateAPY = async () => {
    if (jars) {
      const promises = jars.map(async (jar) => {
        let APYs: Array<JarApy> = [];

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_OKT_CHE) {
          APYs = [{ TEST: 1 }];
        }

        let apr = 0;
        APYs.map((x) => {
          if (x.apr) {
            apr += x.apr;
            delete x.apr;
          }
        });

        let lp = 0;
        APYs.map((x) => {
          if (x.lp) {
            lp += x.lp;
          }
        });

        const totalAPY = getCompoundingAPY(apr / 100) + lp;

        return {
          ...jar,
          APYs,
          totalAPY,
          apr,
          lp,
        };
      });
    }
  };
  useEffect(() => {
    if (network === NETWORK_NAMES.OKEX) calculateAPY();
  }, [jars?.length, prices, network]);

  return { jarsWithAPY };
};
