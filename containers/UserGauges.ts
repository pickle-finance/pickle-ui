import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";

import { Jars } from "./Jars";
import { Gauges } from "./Gauges";
import { Balances } from "./Balances";
import { Contracts } from "./Contracts";
import { Connection } from "./Connection";
import { ERC20Transfer } from "./Erc20Transfer";
import { UserJarData } from "./UserJars";

import { Erc20 as Erc20Contract } from "./Contracts/Erc20";

import { Contract as MulticallContract } from "ethers-multicall";

export interface UserGaugeData {
  poolName: string;
  address: string;
  depositToken: Erc20Contract;
  depositTokenName: string;
  balance: ethers.BigNumber;
  staked: ethers.BigNumber;
  harvestable: ethers.BigNumber;
  usdPerToken: number;
  allocPoint: number;
  fullApy: number;
  gaugeWeight: number;
  totalWeight: number;
  userWeight: number;
  userCurrentWeights: number;
  totalSupply: number;
  jar: UserJarData;
}

const useUserGauges = (): { gaugeData: UserGaugeData[] | null } => {
  const { blockNum, address, multicallProvider } = Connection.useContainer();
  const { gauge, erc20 } = Contracts.useContainer();
  const { jars } = Jars.useContainer();
  const { gauges } = Gauges.useContainer();
  const { gaugeProxy } = Contracts.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [gaugeData, setGaugeData] = useState<Array<UserGaugeData> | null>(null);

  const updateJarAndGaugeData = async () => {
    if (
      gauges &&
      erc20 &&
      gauge &&
      address &&
      gaugeProxy &&
      multicallProvider
    ) {
      const balancesUserInfosHarvestables = await multicallProvider.all(
        gauges.flatMap((x) => {
          const c = new MulticallContract(x.token, erc20.interface.fragments);
          const gaugeContract = new MulticallContract(
            x.gaugeAddress,
            gauge.interface.fragments,
          );

          const gaugeProxyContract = new MulticallContract(
            gaugeProxy.address,
            gaugeProxy.interface.fragments,
          );

          return [
            c.balanceOf(address),
            gaugeContract.balanceOf(address),
            gaugeContract.earned(address),
            gaugeProxyContract.votes(address, x.token),
            gaugeProxyContract.usedWeights(address),
          ];
        }),
      );
      let newJarData = <Array<UserJarData>>[];

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
            balance: balance || 0,
            deposited: deposited || 0,
            usdPerPToken: jar.usdPerPToken || 0,
            APYs: jar.APYs,
            totalAPY: jar.totalAPY,
            tvlUSD: jar.tvlUSD,
            apr: jar.apr,
            depositTokenLink: jar.depositTokenLink,
          };
        });

        newJarData = await Promise.all(promises);
      }

      const newGaugeData = gauges.map((gauge, idx) => {
        const balance = balancesUserInfosHarvestables[idx * 5];
        const staked = balancesUserInfosHarvestables[idx * 5 + 1];
        const harvestable = balancesUserInfosHarvestables[idx * 5 + 2];
        const userWeight = balancesUserInfosHarvestables[idx * 5 + 3];
        const userCurrentWeights = balancesUserInfosHarvestables[idx * 5 + 4];

        const jar = newJarData.find(
          (jar) => jar.jarContract.address === gauge.token,
        );
        return {
          allocPoint: gauge.allocPoint,
          poolName: gauge.poolName,
          address: gauge.gaugeAddress,
          depositToken: erc20.attach(gauge.token),
          depositTokenName: gauge.tokenName,
          balance,
          staked: staked,
          usdPerToken: gauge.usdPerToken,
          harvestable,
          fullApy: gauge.fullApy,
          gaugeWeight: gauge.gaugeWeight,
          totalWeight: gauge.totalWeight,
          userWeight: +userWeight.toString(),
          userCurrentWeights: +userCurrentWeights.toString(),
          totalSupply: gauge.totalSupply,
          jar: jar,
        };
      });

      setGaugeData(newGaugeData);
    }
  };

  useEffect(() => {
    updateJarAndGaugeData();
  }, [jars, blockNum, tokenBalances, transferStatus]);

  return { gaugeData };
};

export const UserGauges = createContainer(useUserGauges);
