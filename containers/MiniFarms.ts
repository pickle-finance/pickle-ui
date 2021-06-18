import { createContainer } from "unstated-next";

import { useWithReward } from "./MiniFarms/useWithReward";
import { useUniV2Apy } from "./Farms/useUniV2Apy";
import { useJarFarmApy } from "./Farms/useJarFarmApy";
import { useFetchFarms } from "./Farms/useFetchFarms";

interface IFarmInfo {
  [key: string]: { tokenName: string; poolName: string };
}

export const FarmInfo: IFarmInfo = {
  "0x9eD7e3590F2fB9EEE382dfC55c71F9d3DF12556c": {
    tokenName: "pCLP USDC/WETH",
    poolName: "pCLP USDC/WETH",
  },
  "0x7512105DBb4C0E0432844070a45B7EA0D83a23fD": {
    tokenName: "pCLP PICKLE/MUST",
    poolName: "pCLP PICKLE/MUST",
  },
  "0x91bcc0BBC2ecA760e3b8A79903CbA53483A7012C": {
    tokenName: "pCLP MATIC/MUST",
    poolName: "pCLP MATIC/MUST",
  },
  "0x0519848e57Ba0469AA5275283ec0712c91e20D8E": {
    tokenName: "pAaveDAI",
    poolName: "pAaveDAI",
  },
  "0x1A602E5f4403ea0A5C06d3DbD22B75d3a2D299D5": {
    tokenName: "p3CRV",
    poolName: "p3CRV",
  },
  "0x80aB65b1525816Ffe4222607EDa73F86D211AC95": {
    tokenName: "pSLP ETH/USDT",
    poolName: "pSLP ETH/USDT",
  },
  "0xd438Ba7217240a378238AcE3f44EFaaaF8aaC75A": {
    tokenName: "pSLP ETH/MATIC",
    poolName: "pSLP ETH/MATIC",
  },
};

function useFarms() {
  const { rawFarms } = useFetchFarms();
  const { farmsWithReward } = useWithReward(rawFarms);
  const { jarFarmWithApy } = useJarFarmApy(farmsWithReward)

  const jarFarms = jarFarmWithApy?.map((farm) => {
    const { tokenName, poolName } = FarmInfo[farm.lpToken];
    return {
      ...farm,
      tokenName,
      poolName,
    };
  });

  return {
    farms: jarFarms,
  };
}

export const MiniFarms = createContainer(useFarms);
