import { useState, useEffect } from "react";

import { Strategy as StrategyContract } from "../Contracts/Strategy";
import { Jar as JarContract } from "../Contracts/Jar";
import { Jar__factory as JarFactory } from "../Contracts/factories/Jar__factory";
import { Erc20 as Erc20Contract } from "../Contracts/Erc20";
import { Erc20__factory as Erc20Factory } from "../Contracts/factories/Erc20__factory";
import { Contract as MulticallContract } from "ethers-multicall";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import {
  JAR_DEPOSIT_TOKENS,
  DEPOSIT_TOKENS_JAR_NAMES,
  DEPOSIT_TOKENS_NAME,
  DEPOSIT_TOKENS_LINK,
} from "./jars";
import { Contract } from "@ethersproject/contracts";
import { networkInterfaces } from "os";
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
    const r1 : Jar[] = await getJarsOldImpl();
    const r2 : Jar[] = await getJarsPfcoreImpl();

    const stringOnly = (x:Jar) => {
      return {
        depositToken: x.depositToken.address,
        depositTokenName: x.depositTokenName,
        depositTokenLink: x.depositTokenLink,
        jarName: x.jarName,
        contract: x.contract.address,
      }
    }
    const r1a = r1.map((x)=>stringOnly((x)));
    const r2a = r2.map((x)=>stringOnly((x)));
    
    console.log("\n\n\n" + JSON.stringify(r1.map((x)=>stringOnly((x)))));
    console.log("\n\n\n" + JSON.stringify(r2.map((x)=>stringOnly((x)))));
    
    console.log("Lengths:  original: " + r1a.length + ", new: " + r2a.length);
    for( let i = 0; i < r1a.length; i++ ) {
      const matchingR2 = r2a.find((x)=>x.depositToken.toLowerCase() === r1a[i].depositToken.toLowerCase());
      console.log("Index " + i);
      console.log("Original: " + JSON.stringify(r1a[i]));
      console.log("New: " + JSON.stringify(matchingR2 || "nothinghere"));
      
    }
    setJars(r1);
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

  const getJarsOldImpl = async () : Promise<Jar[]> => {
    if (controller && strategy && multicallProvider && chainName) {
      const multicallController = new MulticallContract(
        controller.address,
        controller.interface.fragments,
      );

      const tokenKVUnfiltered = Object.entries(
        JAR_DEPOSIT_TOKENS[chainName],
      ).map(([k, tokenAddress]) => {
        return {
          key: k,
          value: tokenAddress,
        };
      });

      const tokenKV = tokenKVUnfiltered.filter(
        ({ key, value }) => !IsMaiToken(value),
      );
      const tokenKVMai = tokenKVUnfiltered.filter(({ key, value }) =>
        IsMaiToken(value),
      );

      let jarAddresses = await multicallProvider.all(
        tokenKV.map((t) => {
          return multicallController.jars(t.value);
        }),
      );

      if (controllerMai && chainName === NETWORK_NAMES.POLY) {
        const multicallControllerMai = new MulticallContract(
          controllerMai.address,
          controllerMai.interface.fragments,
        );

        const maiJarAddresses = await multicallProvider.all(
          tokenKVMai.map((t) => {
            return multicallControllerMai.jars(t.value);
          }),
        );
        jarAddresses = [...jarAddresses, ...maiJarAddresses];
      }

      const jarData = tokenKV
        .concat(tokenKVMai)
        .map((kv, idx) => {
          return {
            [kv.key]: {
              tokenAddress: kv.value,
              jarAddress: jarAddresses[idx],
            },
          };
        })
        .reduce((acc, x) => {
          return { ...acc, ...x };
        }, {});

      const newJars = await Promise.all(
        Object.entries(JAR_DEPOSIT_TOKENS[chainName]).map(
          async ([k, tokenAddress]) => {
            const { jarAddress } = jarData[k];
            return {
              depositToken: Erc20Factory.connect(tokenAddress, provider),
              depositTokenName:
                DEPOSIT_TOKENS_NAME[k as keyof typeof DEPOSIT_TOKENS_NAME],
              jarName:
                DEPOSIT_TOKENS_JAR_NAMES[
                  k as keyof typeof DEPOSIT_TOKENS_JAR_NAMES
                ],
              depositTokenLink:
                DEPOSIT_TOKENS_LINK[k as keyof typeof DEPOSIT_TOKENS_LINK],
              contract: JarFactory.connect(jarAddress, provider),
            };
          },
        ),
      );
      return newJars;
    }
    return [];
  };

  useEffect(() => {
    getJars();
  }, [chainName, multicallProvider, controller, blockNum]);

  return { jars };
};
