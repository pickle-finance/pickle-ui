import { useState, useEffect } from "react";

import { Strategy as StrategyContract } from "../Contracts/Strategy";
import { Jar as JarContract } from "../Contracts/Jar";
import { Jar__factory as JarFactory } from "../Contracts/factories/Jar__factory";
import { Erc20 as Erc20Contract } from "../Contracts/Erc20";
import { Erc20__factory as Erc20Factory } from "../Contracts/factories/Erc20__factory";
import { Contract as MulticallContract } from "ethers-multicall";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { NETWORK_NAMES, NETWORK_NAMES_PFCORE_MAP } from "containers/config";
import { ChainNetwork } from "picklefinance-core";
import { AssetEnablement, JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { PickleCore } from "./usePickleCore";

export type Jar = {
  depositToken: Erc20Contract;
  depositTokenName: string;
  depositTokenLink: string;
  jarName: string;
  contract: JarContract;
};

const IsMaiToken = (address: string): boolean => {
  return address === JAR_DEPOSIT_TOKENS[NETWORK_NAMES.POLY].QUICK_MIMATIC_QI;
};

export const useFetchJars = (): { jars: Array<Jar> | null } => {
  const {
    blockNum,
    provider,
    multicallProvider,
    chainName,
  } = Connection.useContainer();
  const { controller, strategy, controllerMai } = Contracts.useContainer();
  const { pickleCore } = PickleCore.useContainer();


  const [jars, setJars] = useState<Array<Jar> | null>(null);

  const getJars = async () => {
    // I want to use r2, but it breaks the site. Find out why
    const r2 : Jar[] = await getJarsPfcoreImpl();
    setJars(r2);
  }


  const getJarsPfcoreImpl = async () : Promise<Jar[]> => {
    if (controller && strategy && multicallProvider && chainName) {
      const pfcoreChainName : ChainNetwork = NETWORK_NAMES_PFCORE_MAP[chainName];
      const allJars : JarDefinition[] | undefined = pickleCore?.assets.jars;
      if( !allJars ) {
        // Time to return, dead
        console.log("This shit is dead, cant even find jars");
        return [];
      }

      const chainJars : JarDefinition[] = allJars.filter((x)=>x.chain === pfcoreChainName && 
          x.enablement !== AssetEnablement.PERMANENTLY_DISABLED &&  x.enablement !== AssetEnablement.DEV);
      const possibleJars : (Jar|undefined)[] = chainJars.map((x)=>{
        const z : Jar = {
          depositToken: Erc20Factory.connect(x.depositToken.addr, provider),
          depositTokenName: x.depositToken.name,
          jarName: x.id,
          depositTokenLink: x.depositToken.link,
          contract: JarFactory.connect(x.contract, provider),
        };
        console.log("Created jar struct for: " + x.details.apiKey);

        return z;
      });
      const jarsOnly : Jar[] = [];
      for( let i = 0; i < possibleJars.length; i++ ) {
        if( possibleJars[i] !== undefined ) 
          jarsOnly.push(possibleJars[i] as Jar);
      }
      return jarsOnly;
    }
    return [];
  };

  useEffect(() => {
    getJars();
  }, [chainName, multicallProvider, controller, blockNum]);

  return { jars };
};
