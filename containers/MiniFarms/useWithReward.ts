import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { Contract as MulticallContract } from "ethers-multicall";

import { Prices } from "../Prices";
import { MiniPickles } from "../Pickles";
import { Contracts } from "../Contracts";
import { Connection } from "../Connection";
import { RawFarm } from "../Farms/useFetchFarms";

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
  const { multicallProvider } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  const { picklePerSecond, maticPerSecond } = MiniPickles.useContainer();

  const [farms, setFarms] = useState<Array<FarmWithReward> | null>(null);

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
      const totalAllocPoints = rawFarms.reduce(
        (acc: number, farm) => acc + farm.allocPoint.toNumber(),
        0,
      );

      const pickleRewarderMulticallContract = new MulticallContract(
        pickleRewarder.address,
        pickleRewarder.interface.fragments,
      );
      const rewarderPoolInfo = await multicallProvider.all<PoolInfo[]>(
        rawFarms.map((farm) =>
          pickleRewarderMulticallContract.poolInfo(farm.poolIndex),
        ),
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
  }, [rawFarms?.length, picklePerSecond, maticPerSecond, prices]);

  return { farmsWithReward: farms };
};
