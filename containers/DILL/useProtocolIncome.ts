import { useState, useEffect } from "react";
import fetch from "node-fetch";
import { ethers } from "ethers";
import { getAssetPerformanceData } from "../../util/api.js";
import { crvJars, uniJars, sushiJars } from "../../util/jars.js";

export function useProtocolIncome() {
  const [weeklyProfit, setWeeklyProfit] = useState<number | null>(null);
  const [weeklyDistribution, setWeeklyDistribution] = useState<number | null>(null);
  const jarList = [...crvJars, ...uniJars, ...sushiJars];

  const getWeeklyIncome = async () => {
    const jarList = await fetch(
      `https://api.pickle-jar.info/protocol/pools`,
    ).then((response) => response.json());

    const jarPerformance = await Promise.all(
      jarList.map(async (jar) => {
        const apy = await getAssetPerformanceData(jar.identifier);
        return {
          ...jar,
          apy: apy.threeDay,
        };
      }),
    );

    const profit = jarPerformance.reduce((acc, currJar) => {
      const jarTVL = currJar.liquidity_locked;
      return acc + (jarTVL * currJar.apy * 0.01 * 0.2) / 52;
    }, 0) as number;
    
    const weeklyDistribution = profit * 0.45;

    setWeeklyProfit(profit)
    setWeeklyDistribution(weeklyDistribution);
  };

  useEffect(() => {
    getWeeklyIncome();
  }, []);

  return {
    weeklyProfit,
    weeklyDistribution,
  };
}
