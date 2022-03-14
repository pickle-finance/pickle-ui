import { useState, useEffect } from "react";

import { UserJarData } from "../../containers/UserJars";

import { Jars } from "../../containers/Jars";
import { Balances } from "../../containers/Balances";
import { Connection } from "../../containers/Connection";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import { useJarsWithUniV3 } from "containers/Jars/useJarsWithUniV3";

export const useJarData = (): { jarData: UserJarData[] | null } => {
  const { blockNum, chainName } = Connection.useContainer();
  const { jars } = Jars.useContainer();
  const { jarsWithV3 } = useJarsWithUniV3(jars);
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [jarData, setJarData] = useState<UserJarData[] | null>(null);

  const updateJarData = () => {
    if (jarsWithV3) {
      const data: UserJarData[] = jarsWithV3?.map(
        (jar): UserJarData => {
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
            tvlUSD: jar.tvlUSD || 0,
            protocol: jar.protocol,
            stakingProtocol: jar.stakingProtocol,
            apiKey: jar.apiKey,
          };
        },
      );

      setJarData(data);
    }
  };

  useEffect(() => {
    updateJarData();
  }, [chainName, jars, jarsWithV3, blockNum, tokenBalances, transferStatus]);

  return { jarData };
};
