import { useState, useEffect } from "react";

import { Strategy as StrategyContract } from "../Contracts/Strategy";
import { Jar as JarContract } from "../Contracts/Jar";
import { JarFactory } from "../Contracts/JarFactory";
import { Erc20 as Erc20Contract } from "../Contracts/Erc20";
import { Erc20Factory } from "../Contracts/Erc20Factory";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts-Ethereum";
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
};

export const useFetchJars = (): { jars: Array<Jar> | null } => {
  const {
    blockNum,
    multicallProvider,
    chainName,
  } = Connection.useContainer();
  const { controller, strategy } = Contracts.useContainer();

  const [jars, setJars] = useState<Array<Jar> | null>(null);

  const getJars = async () => {
    if (controller && strategy && multicallProvider && chainName) {
      const multicallController = new Contract(
        controller.address,
        controller.interface.fragments,
        multicallProvider,
      );

      const tokenKV = Object.entries(JAR_DEPOSIT_TOKENS[chainName]).map(
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

      const jarData = tokenKV
        .map((kv, idx) => {
          return {
            [kv.key]: {
              tokenAddress: kv.value,
              jarAddress: jarAddresses[idx],
              strategyAddress: strategyAddresses[idx],
            },
          };
        })
        .reduce((acc, x) => {
          return { ...acc, ...x };
        }, {});

      const newJars = await Promise.all(
        Object.entries(JAR_DEPOSIT_TOKENS[chainName]).map(async ([k, tokenAddress]) => {
          const { jarAddress, strategyAddress } = jarData[k];
          return {
            depositToken: Erc20Factory.connect(tokenAddress, multicallProvider),
            depositTokenName:
              DEPOSIT_TOKENS_NAME[k as keyof typeof DEPOSIT_TOKENS_NAME],
            strategy: strategy.attach(strategyAddress),
            jarName:
              DEPOSIT_TOKENS_JAR_NAMES[
                k as keyof typeof DEPOSIT_TOKENS_JAR_NAMES
              ],
            depositTokenLink:
              DEPOSIT_TOKENS_LINK[k as keyof typeof DEPOSIT_TOKENS_LINK],
            contract: JarFactory.connect(jarAddress, multicallProvider),
          };
        }),
      );
      setJars(newJars);
    }
  };

  useEffect(() => {
    getJars();
  }, [multicallProvider, controller, blockNum]);

  return { jars };
};
