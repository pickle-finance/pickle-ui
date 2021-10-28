import { useState, useEffect } from "react";

import { Jars } from "../../containers/Jars";
import { Balances } from "../../containers/Balances";
import { Connection } from "../../containers/Connection";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import { DEPOSIT_TOKENS_JAR_NAMES } from "../../containers/Jars/jars";
import { Jar as JarContract } from "containers/Contracts/Jar";
import { JarV3 as JarV3Contract } from "containers/Contracts/JarV3";
import { Erc20 as Erc20Contract } from "containers/Contracts/Erc20";
import { BigNumber, ethers } from "ethers";
import { UniV3Token, useJarsWithUniV3 } from "containers/Jars/useJarsWithUniV3";
import { JarApy } from "containers/Jars/useJarsWithAPYEth";

export interface UserJarData {
  name: string;
  ratio: number;
  jarContract: JarContract | JarV3Contract;
  depositToken: Erc20Contract;
  depositTokenName: string;
  balance: BigNumber;
  deposited: ethers.BigNumber;
  usdPerPToken: number;
  APYs: JarApy[];
  totalAPY: number;
  apr: number;
  depositTokenLink: string;
  tvlUSD: number;
  token0: UniV3Token | null;
  token1: UniV3Token | null;
  proportion: BigNumber | null;
  supply: number;
}

export const useJarData = (): { jarData: UserJarData[] | null } => {
  const { blockNum } = Connection.useContainer();
  const { jars } = Jars.useContainer();
  const { jarsWithV3 } = useJarsWithUniV3(jars);
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [jarData, setJarData] = useState<Array<UserJarData> | null>(null);

  const updateJarData = async () => {
    if (jarsWithV3) {
      const promises = jarsWithV3.map((jar) => {
        const balance = getBalance(jar.depositToken.address) || 0;
        const deposited = getBalance(jar.contract.address) || 0;
        return {
          name: jar.jarName,
          jarContract: jar.contract,
          depositToken: jar.depositToken,
          depositTokenName: jar.depositTokenName,
          ratio: jar.ratio || 0,
          balance,
          deposited,
          usdPerPToken: jar.usdPerPToken || 0,
          APYs: jar.APYs,
          totalAPY: jar.totalAPY,
          apr: jar.apr,
          depositTokenLink: jar.depositTokenLink,
          token0: jar.token0,
          token1: jar.token1,
          proportion: jar.proportion,
          supply: jar.supply,
        };
      });
      const newJars = await Promise.all(promises);
      setJarData(newJars);
    }
  };

  useEffect(() => {
    updateJarData();
  }, [jars, blockNum, tokenBalances, transferStatus]);

  return { jarData };
};
