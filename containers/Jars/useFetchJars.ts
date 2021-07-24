import { useState, useEffect } from "react";

import { Strategy as StrategyContract } from "../Contracts/Strategy";
import { Jar as JarContract } from "../Contracts/Jar";
import { Jar__factory as JarFactory } from "../Contracts/factories/Jar__factory";

import { Jarsymbiotic } from "../Contracts/Jarsymbiotic";
import { Jarsymbiotic__factory as JarsymbioticFactory } from "../Contracts/factories/Jarsymbiotic__factory";

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
import { NETWORK_NAMES } from "containers/config";

export type Jar = {
  depositToken: Erc20Contract;
  depositTokenName: string;
  depositTokenLink: string;
  jarName: string;
  contract: JarContract | Jarsymbiotic;
};

const IsV5Token = (address: string): boolean => {
  return address === JAR_DEPOSIT_TOKENS["Ethereum"].ALETH;
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
  const { controller, controllerv5, strategy, controllerMai } = Contracts.useContainer();

  const [jars, setJars] = useState<Array<Jar> | null>(null);

  const getJars = async () => {
    if (
      controller &&
      controllerv5 &&
      strategy &&
      multicallProvider &&
      chainName &&
      controllerMai
    ) {
      const multicallController = new MulticallContract(
        controller.address,
        controller.interface.fragments,
      );

      const multicallControllerv5 = new MulticallContract(
        controllerv5.address,
        controllerv5.interface.fragments,
      );

      const multicallControllerMai = new MulticallContract(
        controllerMai.address,
        controllerMai.interface.fragments,
      );

      const tokenKVUnfiltered = Object.entries(JAR_DEPOSIT_TOKENS[chainName])
        .map(([k, tokenAddress]) => {
          return {
            key: k,
            value: tokenAddress,
          };
        });

      const tokenKVV5 = Object.entries(JAR_DEPOSIT_TOKENS[chainName])
        .filter(([key, address]) => IsV5Token(address))
        .map(([k, tokenAddress]) => {
          return {
            key: k,
            value: tokenAddress,
          };
        });


      const tokenKV = tokenKVUnfiltered.filter(({key, value}) => !IsMaiToken(value) &&!IsV5Token(value))
      const tokenKVMai = tokenKVUnfiltered.filter(({key, value}) => IsMaiToken(value))  

      let jarAddresses = await multicallProvider.all(
        tokenKV.map((t) => {
          return multicallController.jars(t.value);
        }),
      );

      const jarAddressesv5 = await multicallProvider.all(
        tokenKVV5.map((t) => {
          return multicallControllerv5.jars(t.value);
        }),
      );

      const maiJarAddresses = await multicallProvider.all(
        tokenKVMai.map((t) => {
          return multicallControllerMai.jars(t.value);
        }),
      );

      jarAddresses = [...jarAddresses, ...jarAddressesv5, ...maiJarAddresses];
    
      const jarData = tokenKV
        .concat(tokenKVV5)
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
            let contract;
            if (IsV5Token(tokenAddress))
              contract = JarsymbioticFactory.connect(jarAddress, provider);
            else contract = JarFactory.connect(jarAddress, provider);

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
              contract,
            };
          },
        ),
      );
      setJars(newJars);
    }
  };

  useEffect(() => {
    getJars();
  }, [chainName, multicallProvider, controller, blockNum]);

  return { jars };
};
