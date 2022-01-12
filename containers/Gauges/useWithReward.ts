import { useEffect, useState } from "react";
import { Prices } from "../Prices";
import { Pickles } from "../Pickles";
import { RawGauge } from "./useFetchGauges";

// this hook calculates and adds the following properties to the RawGauge objects
export interface GaugeWithReward extends RawGauge {
  rewardRatePerYear: number;
}

// what comes in and goes out of this function
type Input = Array<RawGauge> | null;
type Output = { gaugesWithReward: Array<GaugeWithReward> | null };

export const useWithReward = (rawGauges: Input): Output => {
  const { prices } = Prices.useContainer();
  const { picklePerBlock } = Pickles.useContainer();

  const [gauges, setGauges] = useState<Array<GaugeWithReward> | null>(null);

  const calculateReward = () => {
    if (rawGauges && picklePerBlock && prices) {
      // do calculations for each gauge
      const newGauges = rawGauges.map((gauge) => {
        return {
          ...gauge,
          rewardRatePerYear:
            gauge.allocPoint === 0
              ? 0
              : gauge.derivedSupply
              ? (gauge.rewardRate / gauge.derivedSupply) * 3600 * 24 * 365
              : 0,
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
