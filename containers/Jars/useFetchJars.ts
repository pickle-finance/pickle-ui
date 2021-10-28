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
import { NETWORK_NAMES } from "containers/config";

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

export const isUniV3 = (address: string): boolean => {
  return address === JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV3_RBN_ETH;
};

export const useFetchJars = (): { jars: Array<Jar> | null } => {
  const {
    blockNum,
    provider,
    multicallProvider,
    chainName,
  } = Connection.useContainer();
  const { controller, strategy, controllerMai, controllerUniV3 } = Contracts.useContainer();

  const [jars, setJars] = useState<Array<Jar> | null>(null);

  const getJars = async () => {
    if (controller && strategy && multicallProvider && chainName && controllerUniV3) {
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
        ({ key, value }) => !IsMaiToken(value) && !isUniV3(value),
      );
      const tokenKVMai = tokenKVUnfiltered.filter(({ key, value }) =>
        IsMaiToken(value),
      );

      const tokenKVUniV3 = tokenKVUnfiltered.filter(({ key, value }) =>
        isUniV3(value),
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

      if (controllerUniV3 && chainName === NETWORK_NAMES.ETH) {
        const multicallControllerUniV3 = new MulticallContract(
          controllerUniV3.address,
          controllerUniV3.interface.fragments,
        );
        const uniV3JarAddresses = await multicallProvider.all(
          tokenKVUniV3.map((t) => {
            return multicallControllerUniV3.jars(t.value);
          }),
        );
        jarAddresses = [...jarAddresses, ...uniV3JarAddresses];
      }
      
      const jarData = tokenKV
      .concat(tokenKVMai)
      .concat(tokenKVUniV3)
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
      setJars(newJars);
    }
  };

  useEffect(() => {
    getJars();
  }, [chainName, multicallProvider, controller, blockNum]);

  return { jars };
};
