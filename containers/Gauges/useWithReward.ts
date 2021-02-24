import { useEffect, useState } from "react";
import { Prices } from "../Prices";
import { Pickles } from "../Pickles";
import { RawGauge } from "./useFetchGauges";

// this hook calculates and adds the following properties to the RawGauge objects
export interface GaugeWithReward extends RawGauge {
  totalAllocPoints: number;
  // picklesRewarded: {
  //   perBlock: number;
  //   perYear: number;
  // };
  // valueRewarded: {
  //   perBlock: number;
  //   perYear: number;
  // };
}

// what comes in and goes out of this function
type Input = Array<RawGauge> | null;
type Output = { gaugesWithReward: Array<GaugeWithReward> | null };

export const useWithReward = (rawGauges: Input): Output => {
  const { prices } = Prices.useContainer();
  const { picklePerBlock } = Pickles.useContainer();

  const [gauges, setGauges] = useState<Array<GaugeWithReward> | null>(null);

  const calculateReward = () => {
    if (rawGauges?.length && picklePerBlock && prices) {
      // do calculations for each gauge
      console.log(rawGauges);
      const newGauges = rawGauges.map((gauge) => {
        const fraction = gauge.allocPoint;
        const pickleRewardedPerBlock = fraction * picklePerBlock;
        const valRewardedPerBlock = pickleRewardedPerBlock * prices.pickle;

        return {
          ...gauge,
          // picklesRewarded: {
          //   perBlock: pickleRewardedPerBlock,
          //   perYear: pickleRewardedPerBlock * 276 * 24 * 365,
          // },
          // valueRewarded: {
          //   perBlock: valRewardedPerBlock,
          //   perYear: valRewardedPerBlock * 276 * 24 * 365,
          // },
        };
      });
      setGauges(newGauges);
    }
  };

  useEffect(() => {
    calculateReward();
  }, [rawGauges, picklePerBlock, prices]);

  return { gaugesWithReward: gauges };
};
