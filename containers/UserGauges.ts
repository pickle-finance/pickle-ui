import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";

import { Jars } from "./Jars";
import { Gauges } from "./Gauges";
import { Balances } from "./Balances";
import { Contracts } from "./Contracts";
import { Connection } from "./Connection";
import { ERC20Transfer } from "./Erc20Transfer";

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
  apy: number;
  gaugeWeight: number;
  totalWeight: number;
  userWeight: number;
}

const useUserGauges = (): { gaugeData: UserGaugeData[] | null } => {
  const { blockNum, address, multicallProvider } = Connection.useContainer();
  const { gauge, erc20 } = Contracts.useContainer();
  const { jars } = Jars.useContainer();
  const { gauges } = Gauges.useContainer();
  const { gaugeProxy } = Contracts.useContainer();
  const { tokenBalances } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [gaugeData, setGaugeData] = useState<Array<UserGaugeData> | null>(null);

  const updateGaugeData = async () => {
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
            gaugeProxyContract.votes(x.token, address)
          ];
        }),
      );

        const newGaugeData = gauges.map((gauge, idx) => {
        const balance = balancesUserInfosHarvestables[idx * 4];
        const staked = balancesUserInfosHarvestables[idx * 4 + 1];
        const harvestable = balancesUserInfosHarvestables[idx * 4 + 2];
        const userWeight = balancesUserInfosHarvestables[idx * 4 + 3];

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
          apy: gauge.apy,
          gaugeWeight: gauge.gaugeWeight,
          totalWeight: gauge.totalWeight,
          userWeight: +userWeight.toString(),
        };
      });

      setGaugeData(newGaugeData);
    }
  };

  useEffect(() => {
    updateGaugeData();
  }, [jars, blockNum, tokenBalances, transferStatus]);

  return { gaugeData };
};

export const UserGauges = createContainer(useUserGauges);
