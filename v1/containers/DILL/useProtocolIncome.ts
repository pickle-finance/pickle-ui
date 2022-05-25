import { useState, useEffect } from "react";
import { PickleCore } from "v1/containers/Jars/usePickleCore";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";

type Jar = {
  jarApy: number;
  identifier: string;
  liquidity_locked: number;
};

export function useProtocolIncome() {
  const [weeklyProfit, setWeeklyProfit] = useState<number | null>(null);
  const [weeklyDistribution, setWeeklyDistribution] = useState<number | null>(null);
  const { pickleCore } = PickleCore.useContainer();

  const getWeeklyIncome = async () => {
    if (pickleCore) {
      const jars = pickleCore.assets.jars;
      const profit = jars.reduce((acc, currJar: JarDefinition) => {
        const jarTVL = currJar.details?.harvestStats?.balanceUSD || 0;
        let apr = currJar.aprStats?.components
          .filter((x) => x.compoundable)
          .reduce((acc, curr) => {
            return acc + curr.apr;
          }, 0);
        if (apr === undefined) apr = 0;
        const chain = pickleCore.chains.find((x) => x.network === currJar.chain);
        const perfFee = chain ? chain.defaultPerformanceFee : 0.2;
        const subtotal = (jarTVL * apr * 0.01 * perfFee) / 52;
        return acc + subtotal;
      }, 0);

      const weeklyDistribution = profit * 0.45;

      setWeeklyProfit(profit);
      setWeeklyDistribution(weeklyDistribution);
    }
  };

  useEffect(() => {
    getWeeklyIncome();
  }, [pickleCore]);

  return {
    weeklyProfit,
    weeklyDistribution,
  };
}
