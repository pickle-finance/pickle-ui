import { useState, useEffect } from "react";

import { Jars } from "../../containers/Jars";
import { Balances } from "../../containers/Balances";
import { Connection } from "../../containers/Connection";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import { useJarsWithUniV3 } from "v1/containers/Jars/useJarsWithUniV3";
import { useJarsWithZap } from "v1/containers/Jars/useJarsWithZap";

export const useJarData = (): { jarData: UserJarData[] | null } => {
  const { blockNum, chainName } = Connection.useContainer();
  const { jars } = Jars.useContainer();
  const { jarsWithV3 } = useJarsWithUniV3(jars);
  const { jarsWithZap } = useJarsWithZap(jarsWithV3);
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [jarData, setJarData] = useState<UserJarData[] | null>(null);

  const updateJarData = () => {
    if (jarsWithZap) {
      const data: UserJarData[] = jarsWithZap?.map(
        (jar): UserJarData => {
          const balance = getBalance(jar.depositToken.address) || 0;
          const deposited = getBalance(jar.contract.address) || 0;

          return {
            name: jar.jarName,
            jarContract: jar.contract,
            depositToken: jar.depositToken,
            depositTokenName: jar.depositTokenName,
            depositTokenDecimals: jar.depositTokenDecimals,
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
            apiKey: jar.apiKey,
            zapDetails: jar.zapDetails,
            stakingProtocol: jar.stakingProtocol,
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
