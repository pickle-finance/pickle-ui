import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";

import { JarApy } from "./Jars/useJarsWithAPYEth";

import { Jars } from "./Jars";
import { Balances } from "./Balances";
import { Connection } from "./Connection";
import { ERC20Transfer } from "./Erc20Transfer";

import { Jar as JarContract } from "../containers/Contracts/Jar";
import { Erc20 as Erc20Contract } from "../containers/Contracts/Erc20";

export interface UserJarData {
  name: string;
  ratio: number;
  jarContract: JarContract;
  depositToken: Erc20Contract;
  depositTokenName: string;
  balance: ethers.BigNumber;
  deposited: ethers.BigNumber;
  usdPerPToken: number;
  APYs: JarApy[];
  totalAPY: number;
  apr: number;
  depositTokenLink: string;
  tvlUSD: number;
}

const useUserJars = (): { jarData: UserJarData[] | null } => {
  const { blockNum, chainName } = Connection.useContainer();
  const { jars } = Jars.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [jarData, setJarData] = useState<UserJarData[] | null>(null);

  const updateJarData = () => {
    if (jars) {
      const data: UserJarData[] = jars.map((jar) => {
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
        };
      });

      setJarData(data);
    }
  };

  useEffect(() => {
    updateJarData();
  }, [chainName, jars, blockNum, tokenBalances, transferStatus]);

  return { jarData };
};

export const UserJars = createContainer(useUserJars);
