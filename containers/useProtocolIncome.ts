import { useState, useEffect } from "react";
import fetch from "node-fetch";
import { ethers } from "ethers";
import { getAssetPerformanceData } from "../util/api.js";
import { crvJars, uniJars, sushiJars } from "../util/jars.js";

export interface UseIncomeOutput {
  weeklyIncome?: number | null;
}

export function useProtocolIncome(): UseIncomeOutput {
  const [weeklyIncome, setWeeklyIncome] = useState();
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

    const weeklyIncome = jarPerformance.reduce((acc, currJar) => {
      const jarTVL = currJar.liquidity_locked;
      return acc + (jarTVL * currJar.apy * 0.01 * 0.2) / 52;
    }, 0);
    setWeeklyIncome(weeklyIncome);
  };

  useEffect(() => {
    getWeeklyIncome();
  }, []);

  return {
    weeklyIncome,
  };
}
