import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";

import { Jars } from "./Jars";
import { Farms } from "./Farms";
import { Balances } from "./Balances";
import { Contracts } from "./Contracts";
import { Connection } from "./Connection";
import { ERC20Transfer } from "./Erc20Transfer";

import { Erc20 as Erc20Contract } from "../containers/Contracts/Erc20";

import { Contract as MulticallContract } from "@0xsequence/multicall";

export interface UserFarmData {
  poolName: string;
  poolIndex: number;
  depositToken: Erc20Contract;
  depositTokenName: string;
  balance: ethers.BigNumber;
  staked: ethers.BigNumber;
  harvestable: ethers.BigNumber;
  usdPerToken: number;
  apy: number;
}

const useUserFarms = (): { farmData: UserFarmData[] | null } => {
  const { blockNum, address, multicallProvider } = Connection.useContainer();
  const { masterchef, erc20 } = Contracts.useContainer();
  const { jars } = Jars.useContainer();
  const { farms } = Farms.useContainer();
  const { tokenBalances } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [farmData, setFarmData] = useState<Array<UserFarmData> | null>(null);

  const updateFarmData = async () => {
    if (farms && erc20 && masterchef && address && multicallProvider) {
      const mcMasterchef = new MulticallContract(
        masterchef.address,
        masterchef.interface.fragments,
      );

      const balancesUserInfosHarvestables = await multicallProvider.all(
        farms
          .map((x) => {
            const c = new MulticallContract(
              x.lpToken,
              erc20.interface.fragments,
            );

            return [
              c.balanceOf(address),
              mcMasterchef.userInfo(x.poolIndex, address),
              mcMasterchef.pendingPickle(x.poolIndex, address),
            ];
          })
          .reduce((a, b) => [...a, ...b], []),
      );

      const newFarmData = farms.map((farm, idx) => {
        const balance = balancesUserInfosHarvestables[idx * 3];
        const userInfo = balancesUserInfosHarvestables[idx * 3 + 1];
        const harvestable = balancesUserInfosHarvestables[idx * 3 + 2];

        return {
          poolName: farm.poolName,
          poolIndex: farm.poolIndex,
          depositToken: erc20.attach(farm.lpToken),
          depositTokenName: farm.tokenName,
          balance,
          staked: userInfo[0],
          usdPerToken: farm.usdPerToken,
          harvestable,
          apy: farm.apy,
        };
      });

      setFarmData(newFarmData);
    }
  };

  useEffect(() => {
    updateFarmData();
  }, [jars, blockNum, tokenBalances, transferStatus]);

  return { farmData };
};

export const UserFarms = createContainer(useUserFarms);
