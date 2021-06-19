import { useEffect, useState } from "react";
import { Prices } from "../Prices";
import { MiniPickles } from "../Pickles";
import { Contracts } from "../Contracts";
import { RawFarm } from "../Farms/useFetchFarms";
import { BigNumber } from "ethers";

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
  const { pickleRewarder } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { picklePerSecond, maticPerSecond } = MiniPickles.useContainer();

  const [farms, setFarms] = useState<Array<FarmWithReward> | null>(null);

  const calculateReward = async () => {
    if (
      rawFarms?.length &&
      picklePerSecond &&
      prices &&
      pickleRewarder &&
      maticPerSecond
    ) {
      const totalAllocPoints = rawFarms?.reduce(
        (acc: number, farm) => acc + farm.allocPoint.toNumber(),
        0,
      );

      const rewarderPoolInfo: PoolInfo[] = await Promise.all(
        rawFarms?.map((farm) => {
          return pickleRewarder.poolInfo(farm.poolIndex);
        })
      );

      const totalRewarderAP = rewarderPoolInfo.reduce((acc, curr) => {
        return acc + curr.allocPoint.toNumber();
      }, 0);

      // do calculations for each farm
      const newFarms = rawFarms.map((farm) => {
        const fraction = farm.allocPoint.toNumber() / totalAllocPoints;
        const pickleRewardedPerSecond = fraction * picklePerSecond;
        const valRewardedPerSecond = pickleRewardedPerSecond * prices.pickle;

        const maticFraction =
          rewarderPoolInfo[farm.poolIndex].allocPoint.toNumber() /
          totalRewarderAP;
        const maticRewardedPerSecond = maticFraction * maticPerSecond;
        const maticValuePerSecond = maticRewardedPerSecond * prices.matic;

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
  }, [rawFarms, picklePerSecond, prices]);

  return { farmsWithReward: farms };
};
