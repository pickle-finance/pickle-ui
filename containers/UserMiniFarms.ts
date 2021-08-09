import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers, BigNumber } from "ethers";

import { MiniFarms } from "./MiniFarms";
import { Balances } from "./Balances";
import { Contracts } from "./Contracts";
import { Connection } from "./Connection";
import { ERC20Transfer } from "./Erc20Transfer";
import { updateFarmData } from "./UserFarms";
import { UserFarmData } from "../containers/UserFarms";

export interface UserFarmDataMatic extends UserFarmData {
  harvestableMatic: ethers.BigNumber;
  maticApy: number;
}

const useUserMiniFarms = (): { farmData: UserFarmDataMatic[] | null } => {
  const { blockNum, address, multicallProvider } = Connection.useContainer();
  const { minichef, erc20, pickleRewarder } = Contracts.useContainer();
  const { farms } = MiniFarms.useContainer();
  console.log("mini farms farms", farms);
  const { tokenBalances } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [farmData, setFarmData] = useState<Array<UserFarmData> | null>(null);
  const [farmDataMatic, setFarmDataMatic] = useState<Array<
    UserFarmDataMatic
  > | null>(null);

  const updateMaticFarmData = async () => {
    if (pickleRewarder && farmData && address) {
      const userHarvestableMatic = await Promise.all(
        farmData.map((farm) =>
          pickleRewarder
            .pendingToken(farm.poolIndex, address)
            .catch(() => BigNumber.from(0)),
        ),
      );
      const newFarms = farmData.map((farm, idx) => {
        return {
          ...farm,
          maticApy: farms[idx].maticApy,
          harvestableMatic: userHarvestableMatic[idx],
        };
      });
      setFarmDataMatic(newFarms);
    }
  };

  useEffect(() => {
    updateFarmData(
      farms,
      erc20,
      minichef,
      address,
      multicallProvider,
      setFarmData,
    );
  }, [farms, blockNum, tokenBalances, transferStatus]);

  useEffect(() => {
    updateMaticFarmData();
  }, [farmData]);

  return { farmData: farmDataMatic };
};

export const UserMiniFarms = createContainer(useUserMiniFarms);
