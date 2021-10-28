import { useState, useEffect } from "react";

import { Strategy as StrategyContract } from "../Contracts/Strategy";
import { Jar__factory as JarFactory } from "../Contracts/factories/Jar__factory";
import { Erc20 as Erc20Contract } from "../Contracts/Erc20";
import { Erc20__factory as Erc20Factory } from "../Contracts/factories/Erc20__factory";
import { Contract as MulticallContract } from "ethers-multicall";
import { JarV3__factory as JarV3Factory } from "containers/Contracts/factories/JarV3__factory";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import {
  JAR_DEPOSIT_TOKENS,
  DEPOSIT_TOKENS_JAR_NAMES,
  DEPOSIT_TOKENS_NAME,
  DEPOSIT_TOKENS_LINK,
  getPriceId,
} from "./jars";
import { Contract } from "@ethersproject/contracts";
import { networkInterfaces } from "os";
import { NETWORK_NAMES } from "containers/config";
import { BigNumber, ethers } from "ethers";
import { isUniV3, Jar } from "./useFetchJars";
import { getPoolData, getProportion, uniV3Info } from "util/univ3";
import { JarWithTVL } from "./useJarsWithTVL";
import { Balances } from "containers/Balances";
import { ERC20Transfer } from "containers/Erc20Transfer";
import { useUniV3Data } from "./useUniV3Data";

export interface UniV3Token {
  address: string;
  walletBalance: BigNumber;
  jarAmount: number;
  approved: boolean;
  name: string;
}

export interface JarV3 extends JarWithTVL {
  token0: UniV3Token;
  token1: UniV3Token;
  proportion: BigNumber;
}

export const useJarsWithUniV3 = (
  jars: Array<JarWithTVL> | null,
): { jarsWithV3: Array<JarV3> | null } => {
  const { blockNum, chainName, signer, address } = Connection.useContainer();

  const { erc20 } = Contracts.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { getUniV3Data, uniV3Data } = useUniV3Data();
  const { status: transferStatus } = ERC20Transfer.useContainer();
  const [jarsWithV3, setJarsWithV3] = useState<Array<JarV3> | null>(null);

  const fetchUniV3 = async () => {
    if (jars && signer && erc20 && address) {
      const promises = jars.map(async (jar) => {
        if (!isUniV3(jar.depositToken.address))
          return {
            ...jar,
            token0: null,
            token1: null,
            proportion: null,
          };
        const { incentiveKey } = uniV3Info[
          jar.depositToken.address as keyof typeof uniV3Info
        ];
        const poolData = await getPoolData(
          incentiveKey[1],
          incentiveKey[0],
          signer,
        );

        const balanceData = getUniV3Data(jar.depositToken.address)[0]
        const [bal0, bal1, proportion] = await Promise.all([
          getBalance(poolData.token0),
          getBalance(poolData.token1),
          getProportion(jar.contract.address, signer),
        ]);

        // Check token approvals
        const Token0 = erc20.attach(poolData.token0).connect(signer);
        const Token1 = erc20.attach(poolData.token1).connect(signer);
        const allowance0 = await Token0.allowance(
          address,
          jar.contract.address,
        );
        const allowance1 = await Token1.allowance(
          address,
          jar.contract.address,
        );

        const jarV3Contract = JarV3Factory.connect(
          jar.contract.address,
          signer,
        );

        return {
          ...jar,
          jarContract: jarV3Contract,
          token0: {
            address: poolData.token0,
            walletBalance: bal0,
            jarAmount: balanceData.amount0,
            approved: allowance0.gt(ethers.constants.Zero),
            name: getPriceId(poolData.token0),
          },
          token1: {
            address: poolData.token1,
            walletBalance: bal1,
            jarAmount: balanceData.amount1,
            approved: allowance1.gt(ethers.constants.Zero),
            name: getPriceId(poolData.token1),
          },
          proportion,
        };
      });
      const newJars = await Promise.all(promises);
      setJarsWithV3(newJars);
    }
  };
  useEffect(() => {
    fetchUniV3();
  }, [chainName, jars, blockNum, tokenBalances, transferStatus]);
  return { jarsWithV3 };
};
