import { useState, useEffect } from "react";

import { Strategy as StrategyContract } from "../Contracts/Strategy";
import { Jar as JarContract } from "../Contracts/Jar";
import { JarFactory } from "../Contracts/JarFactory";
import { Erc20 as Erc20Contract } from "../Contracts/Erc20";
import { Erc20Factory } from "../Contracts/Erc20Factory";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts-Polygon";
import {
  JAR_DEPOSIT_TOKENS,
  DEPOSIT_TOKENS_JAR_NAMES,
  DEPOSIT_TOKENS_NAME,
  DEPOSIT_TOKENS_LINK,
} from "./jars";
import { Contract } from "@ethersproject/contracts";

export type Jar = {
  depositToken: Erc20Contract;
  depositTokenName: string;
  depositTokenLink: string;
  jarName: string;
  contract: JarContract;
  strategy: StrategyContract;
  strategyName: string;
};

export const useFetchJars = (): { jars: Array<Jar> | null } => {
  const {
    blockNum,
    polygonMulticallProvider: provider,
    chainName,
  } = Connection.useContainer();
  const { controller, strategy } = Contracts.useContainer();

  const [jars, setJars] = useState<Array<Jar> | null>(null);

  const getJars = async () => {
    if (controller && strategy && provider && chainName) {
      const multicallController = new Contract(
        controller.address,
        controller.interface.fragments,
        provider,
      );

      const tokenKV = Object.entries(JAR_DEPOSIT_TOKENS).map(
        ([k, tokenAddress]) => {
          return {
            key: k,
            value: tokenAddress,
          };
        },
      );

      const jarAddresses = await Promise.all(
        tokenKV.map((t) => {
          return multicallController.jars(t.value);
        }),
      );

      const strategyAddresses = await Promise.all(
        tokenKV.map((t) => {
          return multicallController.strategies(t.value);
        }),
      );

      // const strategyNames = await Promise.all(
      //   strategyAddresses.map((s) => {
      //     const mutlicallStrategy = new Contract(
      //       s,
      //       strategy.interface.fragments,
      //       multicallProvider,
      //     );

      //     return mutlicallStrategy.getName();
      //   }),
      // );

      const jarData = tokenKV
        .map((kv, idx) => {
          return {
            [kv.key]: {
              tokenAddress: kv.value,
              jarAddress: jarAddresses[idx],
              strategyAddress: strategyAddresses[idx],
              // strategyName: strategyNames[idx],
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
