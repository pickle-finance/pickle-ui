import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { Contract, ethers, BigNumber } from "ethers";

import { MiniFarms } from "./MiniFarms";
import { Contracts } from "./Contracts";
import { Connection } from "./Connection";
import { updateFarmData } from "./UserFarms";
import { UserFarmData } from "./UserFarms";
import { ERC20Transfer } from "./Erc20Transfer";
import { NULL_ADDRESS } from "v1/features/Zap/constants";

export interface UserFarmDataMatic extends UserFarmData {
  harvestableMatic: ethers.BigNumber;
  maticApy: number;
  maticValuePerYear: number;
}

const BN_ZERO = BigNumber.from(0);

const useUserMiniFarms = (): { farmData: UserFarmDataMatic[] | null } => {
  const { blockNum, address, multicallProvider } = Connection.useContainer();
  const { minichef, erc20, pickleRewarder } = Contracts.useContainer();
  const { farms } = MiniFarms.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [farmData, setFarmData] = useState<Array<UserFarmDataMatic> | null>(null);
  const [farmDataMatic, setFarmDataMatic] = useState<Array<UserFarmDataMatic> | null>(null);

  const updateMaticFarmData = async () => {
    if (pickleRewarder && farmData && address) {
      const hasRewarder = pickleRewarder.address != NULL_ADDRESS;
      if (!hasRewarder) {
        const newFarms = farmData.map((farm) => {
          return {
            ...farm,
            maticApy: 0,
            harvestableMatic: BigNumber.from(0),
          };
        });
        setFarmDataMatic(newFarms);
        return;
      }
      const userHarvestableMatic = await Promise.all(
        farmData.map((farm) => {
          if (farm.staked.eq(BN_ZERO)) return Promise.resolve(BN_ZERO);
          return pickleRewarder
            .pendingToken(farm.poolIndex, address)
            .catch(() => BigNumber.from(0));
        }),
      );
      const newFarms = farmData.map((farm, idx) => {
        return {
          ...farm,
          maticApy: farms[idx].maticApy,
          maticValuePerYear: farms[idx].maticValuePerYear,
          harvestableMatic: userHarvestableMatic[idx],
        };
      });
      setFarmDataMatic(newFarms);
    }
  };

  useEffect(() => {
    updateFarmData(farms, erc20, minichef, address, multicallProvider, setFarmData);
  }, [farms, blockNum, transferStatus]);

  useEffect(() => {
    updateMaticFarmData();
  }, [farmData]);

  return { farmData: farmDataMatic };
};

export const UserMiniFarms = createContainer(useUserMiniFarms);
