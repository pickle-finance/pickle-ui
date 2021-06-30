import { useState, useEffect } from "react";
import fetch from "node-fetch";
import { PoolData } from "../Jars/usePoolData";

type Jar = {
  jarApy: number;
  identifier: string;
  liquidity_locked: number;
};

export function useProtocolIncome() {
  const [weeklyProfit, setWeeklyProfit] = useState<number | null>(null);
  const [weeklyDistribution, setWeeklyDistribution] = useState<number | null>(
    null,
  );
  const { poolData } = PoolData.useContainer();

  const getWeeklyIncome = async () => {
    if (poolData) {
      const profit = poolData.reduce((acc, currJar) => {
        const jarTVL = currJar.liquidity_locked;
        return +currJar.jarApy > 0
          ? acc + (jarTVL * currJar.jarApy * 0.01 * 0.2) / 52
          : acc;
      }, 0);

      const weeklyDistribution = profit * 0.45;

      setWeeklyProfit(profit);
      setWeeklyDistribution(weeklyDistribution);
    }
  };

  useEffect(() => {
    getWeeklyIncome();
  }, [poolData]);

  return {
    weeklyProfit,
    weeklyDistribution,
  };
}
