import { useState, useEffect } from "react";

import { Jar as JarContract } from "../Contracts/Jar";
import { Jar__factory as JarFactory } from "../Contracts/factories/Jar__factory";
import { JarNative__factory as JarNativeFactory } from "v1/containers/Contracts/factories/JarNative__factory";
import { Erc20 as Erc20Contract } from "../Contracts/Erc20";
import { Erc20__factory as Erc20Factory } from "../Contracts/factories/Erc20__factory";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { ChainNetwork } from "picklefinance-core";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { PickleCore } from "./usePickleCore";
import { isCroToken, shouldJarBeInUi } from "./jars";
import { JarNative as JarNativeContract } from "v1/containers/Contracts/JarNative";

export type Jar = {
  depositToken: Erc20Contract;
  depositTokenName: string;
  depositTokenLink: string;
  depositTokenDecimals: number;
  jarName: string;
  contract: JarContract | JarNativeContract;
  protocol: string;
  stakingProtocol?: string;
  chain: ChainNetwork;
  apiKey: string;
  supply: number;
  isErc20: boolean;
  tvlUSD: number;
  usdPerPToken: null | number;
  ratio: null | number;
};

const isNative = (address: string) => isCroToken(address);

export const useFetchJars = (): { jars: Array<Jar> | null } => {
  const { blockNum, provider, multicallProvider, chainName } = Connection.useContainer();
  const { controller, strategy } = Contracts.useContainer();
  const { pickleCore } = PickleCore.useContainer();

  const [jars, setJars] = useState<Array<Jar> | null>(null);

  const getJars = async () => {
    // I want to use r2, but it breaks the site. Find out why
    const r2: Jar[] = await getJarsPfcoreImpl();
    setJars(r2);
  };

  const getJarsPfcoreImpl = async (): Promise<Jar[]> => {
    if (controller && strategy && multicallProvider && chainName) {
      const allJars: JarDefinition[] | undefined = pickleCore?.assets.jars;
      if (!allJars) {
        // Time to return, dead
        return [];
      }

      const chainJars: JarDefinition[] = allJars.filter(
        (x) => x.chain === chainName && shouldJarBeInUi(x, pickleCore),
      );

      const possibleJars: (Jar | undefined)[] = chainJars.map((x) => {
        const tvlUSD = (x.details?.tokenBalance || 0) * (x.depositToken?.price || 0);
        const z: Jar = {
          depositToken: Erc20Factory.connect(x.depositToken.addr, provider),
          depositTokenName: x.depositToken.name,
          jarName: x.id,
          depositTokenLink: x.depositToken.link,
          depositTokenDecimals: x.depositToken.decimals ?? 18,
          contract: isNative(x.depositToken.addr)
            ? JarNativeFactory.connect(x.contract, provider)
            : JarFactory.connect(x.contract, provider),
          protocol: x.protocol,
          ratio: x.details?.ratio || 0,
          stakingProtocol: x.stakingProtocol,
          chain: x.chain,
          apiKey: x.details.apiKey,
          supply: x.details.totalSupply || 0,
          isErc20: x.depositToken.style?.erc20 ?? true,
          tvlUSD,
          usdPerPToken: tvlUSD / (x.details.totalSupply || 1),
          ratio: x.details.ratio || 0,
        };

        return z;
      });
      const jarsOnly: Jar[] = [];
      for (let i = 0; i < possibleJars.length; i++) {
        if (possibleJars[i] !== undefined) jarsOnly.push(possibleJars[i] as Jar);
      }
      return jarsOnly;
    }
    return [];
  };

  useEffect(() => {
    getJars();
  }, [pickleCore, chainName, multicallProvider, controller, blockNum]);

  return { jars };
};
