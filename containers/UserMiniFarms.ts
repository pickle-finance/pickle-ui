import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { Contract, ethers } from "ethers";

import { Jars } from "./Jars";
import { MiniFarms } from "./MiniFarms";
import { Balances } from "./Balances";
import { Contracts } from "./Contracts";
import { Connection } from "./Connection";
import { ERC20Transfer } from "./Erc20Transfer";
import { updateFarmData } from "./UserFarms";

import { Erc20 as Erc20Contract } from "../containers/Contracts/Erc20";
import { NETWORK_NAMES } from "./config";

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

const useUserMiniFarms = (): { farmData: UserFarmData[] | null } => {
  const {
    blockNum,
    address,
    multicallProvider,
    chainName,
  } = Connection.useContainer();
  const { minichef, erc20 } = Contracts.useContainer();
  const { jars } = Jars.useContainer();
  const { farms } = MiniFarms.useContainer();
  const { tokenBalances } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();

  const [farmData, setFarmData] = useState<Array<UserFarmData> | null>(null);

  useEffect(() => {
    updateFarmData(
      farms,
      erc20,
      minichef,
      address,
      multicallProvider,
      setFarmData,
    );
  }, [jars, blockNum, tokenBalances, transferStatus]);

  return { farmData };
};

export const UserMiniFarms = createContainer(useUserMiniFarms);
