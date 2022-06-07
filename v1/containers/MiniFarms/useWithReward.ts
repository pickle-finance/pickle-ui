import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { Contract as MulticallContract } from "ethers-multicall";

import { Prices } from "../Prices";
import { MiniPickles } from "../Pickles";
import { Contracts } from "../Contracts";
import { Connection } from "../Connection";
import { RawFarm } from "../Farms/useFetchFarms";
import { NULL_ADDRESS } from "v1/features/Zap/constants";
import { ChainNetwork } from "picklefinance-core";

// this hook calculates and adds the following properties to the RawFarm objects
export interface FarmWithReward extends RawFarm {
  totalAllocPoints: number;
  picklesRewarded: {
    perBlock: number;
    perYear: number;
  };
  valueRewarded: {
    perBlock: number;
    perYear: number;
  };
  maticRewardedPerYear: number;
  maticValuePerYear: number;
}

interface PoolInfo {
  accPicklePerShare: BigNumber;
  allocPoint: BigNumber;
  lastRewardTime: BigNumber;
}

// what comes in and goes out of this function
type Input = Array<RawFarm> | null;
type Output = { farmsWithReward: Array<FarmWithReward> | null };

export const useWithReward = (rawFarms: Input): Output => {
  const { chainName } = Connection.useContainer();
  const { pickleRewarder } = Contracts.useContainer();
  const { multicallProvider } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  const { picklePerSecond, maticPerSecond } = MiniPickles.useContainer();

  const [farms, setFarms] = useState<Array<FarmWithReward> | null>(null);
  let rewarderPoolInfo: any;
  let totalRewarderAP = 0;
  let maticRewardedPerSecond = 0;
  let maticValuePerSecond = 0;

  const calculateReward = async () => {
    if (
      rawFarms &&
      prices &&
      pickleRewarder &&
      multicallProvider &&
      // NOTE: these values can be 0, which is a falsy value.
      typeof maticPerSecond === "number" &&
      typeof picklePerSecond === "number"
    ) {
      const hasRewarder = pickleRewarder.address != NULL_ADDRESS;
      const totalAllocPoints = rawFarms.reduce(
        (acc: number, farm) => acc + farm.allocPoint.toNumber(),
        0,
      );

      if (hasRewarder) {
        const pickleRewarderMulticallContract = new MulticallContract(
          pickleRewarder.address,
          pickleRewarder.interface.fragments,
        );
        rewarderPoolInfo = await multicallProvider.all<PoolInfo[]>(
          rawFarms.map((farm) => pickleRewarderMulticallContract.poolInfo(farm.poolIndex)),
        );

        totalRewarderAP = rewarderPoolInfo.reduce((acc: number, curr: any) => {
          return acc + curr.allocPoint.toNumber();
        }, 0);
      }

      // do calculations for each farm
      const newFarms = rawFarms.map((farm) => {
        const fraction = farm.allocPoint.toNumber() / totalAllocPoints;
        const pickleRewardedPerSecond = fraction * picklePerSecond;
        const valRewardedPerSecond = pickleRewardedPerSecond * prices.pickle;

        if (hasRewarder) {
          const maticFraction =
            rewarderPoolInfo[farm.poolIndex].allocPoint.toNumber() / totalRewarderAP;
          maticRewardedPerSecond = maticFraction * maticPerSecond;
          maticValuePerSecond =
            maticRewardedPerSecond *
            (chainName === ChainNetwork.Metis ? prices.wbtc : prices.matic);
        }

        return {
          ...farm,
          totalAllocPoints,
          picklesRewarded: {
            perBlock: pickleRewardedPerSecond * 2,
            perYear: pickleRewardedPerSecond * 3600 * 24 * 365,
          },
          valueRewarded: {
            perBlock: valRewardedPerSecond,
            perYear: valRewardedPerSecond * 3600 * 24 * 365,
          },
          maticRewardedPerYear: maticRewardedPerSecond * 3600 * 24 * 365,
          maticValuePerYear: maticValuePerSecond * 3600 * 24 * 365,
        };
      });
      setFarms(newFarms);
    }
  };

  useEffect(() => {
    calculateReward();
  }, [rawFarms, picklePerSecond, maticPerSecond, prices]);

  return { farmsWithReward: farms };
};
