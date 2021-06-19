import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { Contract, ethers, BigNumber } from "ethers";

import { Jars } from "./Jars";
import { MiniFarms } from "./MiniFarms";
import { Balances } from "./Balances";
import { Contracts } from "./Contracts";
import { Connection } from "./Connection";
import { ERC20Transfer } from "./Erc20Transfer";
import { updateFarmData } from "./UserFarms";
import { UserFarmData } from "../containers/UserFarms";

import { Erc20 as Erc20Contract } from "../containers/Contracts/Erc20";
import { NETWORK_NAMES } from "./config";
import { Masterchef } from "./Contracts/Masterchef";
import { FarmInfo } from "./Farms";

export interface UserFarmDataMatic extends UserFarmData {
  harvestableMatic: ethers.BigNumber;
}

const useUserMiniFarms = (): { farmData: UserFarmDataMatic[] | null } => {
  const {
    blockNum,
    address,
    multicallProvider,
    chainName,
  } = Connection.useContainer();
  const { minichef, erc20, pickleRewarder } = Contracts.useContainer();
  const { jars } = Jars.useContainer();
  const { farms } = MiniFarms.useContainer();
  const { tokenBalances } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [farmData, setFarmData] = useState<Array<UserFarmData> | null>(null);
  const [farmDataMatic, setFarmDataMatic] = useState<Array<UserFarmDataMatic> | null>(null);

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
    updateMaticFarmData();
  }, [jars, blockNum, tokenBalances, transferStatus]);

  return { farmData: farmDataMatic };
};

export const UserMiniFarms = createContainer(useUserMiniFarms);
