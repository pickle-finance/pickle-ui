import { useEffect, useState } from "react";
import { Prices } from "../Prices";
import { Pickles } from "../Pickles";
import { RawFarm } from "./useFetchFarms";

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
}

// what comes in and goes out of this function
type Input = Array<RawFarm> | null;
type Output = { farmsWithReward: Array<FarmWithReward> | null };

export const useWithReward = (rawFarms: Input): Output => {
  const { prices } = Prices.useContainer();
  const { picklePerBlock } = Pickles.useContainer();

  const [farms, setFarms] = useState<Array<FarmWithReward> | null>(null);

  const calculateReward = () => {
    if (rawFarms?.length && picklePerBlock && prices) {
      const totalAllocPoints = rawFarms?.reduce(
        (acc: number, farm) => acc + farm.allocPoint.toNumber(),
        0,
      );

      // do calculations for each farm
      const newFarms = rawFarms.map((farm) => {
        const fraction = farm.allocPoint.toNumber() / totalAllocPoints;
        const pickleRewardedPerBlock = fraction * picklePerBlock;
        const valRewardedPerBlock = pickleRewardedPerBlock * prices.pickle;
        return {
          ...farm,
          totalAllocPoints,
          picklesRewarded: {
            perBlock: pickleRewardedPerBlock,
            perYear: pickleRewardedPerBlock * 276 * 24 * 365,
          },
          valueRewarded: {
            perBlock: valRewardedPerBlock,
            perYear: valRewardedPerBlock * 276 * 24 * 365,
          },
        };
      });
      setFarms(newFarms);
    }
  };

  useEffect(() => {
    calculateReward();
  }, [rawFarms, picklePerBlock, prices]);

  return { farmsWithReward: farms };
};
