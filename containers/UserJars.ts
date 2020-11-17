import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";

import { JarApy } from "./Jars/useJarsWithAPY";

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
  depositTokenLink: string;
}

const useUserJars = (): { jarData: UserJarData[] | null } => {
  const { blockNum } = Connection.useContainer();
  const { jars } = Jars.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [jarData, setJarData] = useState<Array<UserJarData> | null>(null);

  const updateJarData = async () => {
    if (jars) {
      const promises = jars?.map(async (jar) => {
        const balance = await getBalance(jar.depositToken.address);
        const deposited = await getBalance(jar.contract.address);

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
          depositTokenLink: jar.depositTokenLink,
        };
      });

      const newJarData = await Promise.all(promises);

      setJarData(newJarData);
    }
  };

  useEffect(() => {
    updateJarData();
  }, [jars, blockNum, tokenBalances, transferStatus]);

  return { jarData };
};

export const UserJars = createContainer(useUserJars);
