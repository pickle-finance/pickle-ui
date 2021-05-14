import { useState, useEffect } from "react";

import { Strategy as StrategyContract } from "../Contracts/Strategy";
import { Jar as JarContract } from "../Contracts/Jar";
import { Jar__factory as JarFactory } from "../Contracts/factories/Jar__factory";
import { Erc20 as Erc20Contract } from "../Contracts/Erc20";
import { Erc20__factory as Erc20Factory } from "../Contracts/factories/Erc20__factory";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import {
  JAR_DEPOSIT_TOKENS,
  DEPOSIT_TOKENS_JAR_NAMES,
  DEPOSIT_TOKENS_NAME,
  DEPOSIT_TOKENS_LINK,
} from "./jars";

import { Contract as MulticallContract } from "ethers-multicall";

export type Jar = {
  depositToken: Erc20Contract;
  depositTokenName: string;
  depositTokenLink: string;
  jarName: string;
  contract: JarContract;
  strategy: StrategyContract;
  strategyName: string;
};

const IsV5Jars = (address: string): boolean => {
  return address === JAR_DEPOSIT_TOKENS.ALCX_ALUSD_3CRV;
};

export const useFetchJars = (): { jars: Array<Jar> | null } => {
  const { blockNum, provider, multicallProvider } = Connection.useContainer();
  const { controller, controllerv5, strategy } = Contracts.useContainer();

  const [jars, setJars] = useState<Array<Jar> | null>(null);

  const getJars = async () => {
    if (
      controller &&
      controllerv5 &&
      provider &&
      strategy &&
      multicallProvider
    ) {
      const multicallController = new MulticallContract(
        controller.address,
        controller.interface.fragments,
      );

      const multicallControllerv5 = new MulticallContract(
        controllerv5.address,
        controllerv5.interface.fragments,
      );

      const tokenKV = Object.entries(JAR_DEPOSIT_TOKENS)
        .filter(([key, address]) => !IsV5Jars(address))
        .map(([k, tokenAddress]) => {
          return {
            key: k,
            value: tokenAddress,
          };
        });

      const tokenKVV5 = Object.entries(JAR_DEPOSIT_TOKENS)
        .filter(([key, address]) => IsV5Jars(address))
        .map(([k, tokenAddress]) => {
          return {
            key: k,
            value: tokenAddress,
          };
        });

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

      jarAddresses = [...jarAddresses, ...jarAddressesv5];

      let strategyAddresses = await multicallProvider.all(
        tokenKV.map((t) => {
          return multicallController.strategies(t.value);
        }),
      );

      const strategyAddressesV5 = await multicallProvider.all(
        tokenKVV5.map((t) => {
          return multicallControllerv5.strategies(t.value);
        }),
      );
      strategyAddresses = [...strategyAddresses, ...strategyAddressesV5];

      const strategyNames = await multicallProvider.all(
        strategyAddresses.map((s) => {
          const mutlicallStrategy = new MulticallContract(
            s,
            strategy.interface.fragments,
          );

          return mutlicallStrategy.getName();
        }),
      );

      const jarData = tokenKV
        .concat(tokenKVV5)
        .map((kv, idx) => {
          return {
            [kv.key]: {
              tokenAddress: kv.value,
              jarAddress: jarAddresses[idx],
              strategyAddress: strategyAddresses[idx],
              strategyName: strategyNames[idx],
            },
          };
        })
        .reduce((acc, x) => {
          return { ...acc, ...x };
        }, {});

      const newJars = await Promise.all(
        Object.entries(JAR_DEPOSIT_TOKENS).map(async ([k, tokenAddress]) => {
          const { jarAddress, strategyAddress, strategyName } = jarData[k];
          return {
            depositToken: Erc20Factory.connect(tokenAddress, provider),
            depositTokenName:
              DEPOSIT_TOKENS_NAME[k as keyof typeof DEPOSIT_TOKENS_NAME],
            strategy: strategy.attach(strategyAddress),
            strategyName,
            jarName:
              DEPOSIT_TOKENS_JAR_NAMES[
                k as keyof typeof DEPOSIT_TOKENS_JAR_NAMES
              ],
            depositTokenLink:
              DEPOSIT_TOKENS_LINK[k as keyof typeof DEPOSIT_TOKENS_LINK],
            contract: JarFactory.connect(jarAddress, provider),
          };
        }),
      );
      setJars(newJars);
    }
  };

  useEffect(() => {
    getJars();
  }, [provider, controller, blockNum]);

  return { jars };
};
