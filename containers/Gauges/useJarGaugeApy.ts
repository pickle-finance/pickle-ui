import { useState, useEffect } from "react";

import { Prices } from "../Prices";
import { JAR_GAUGE_MAP } from "./gauges";
import { GaugeWithApy } from "./useUniV2Apy";
import { GaugeWithReward } from "./useWithReward";
import { Jars } from "../Jars";
import { PICKLE_JARS } from "../../containers/Jars/jars";
import { getFarmData } from "../../util/api";

// what comes in and goes out of this function
type Input = GaugeWithReward[] | null;
type Output = { jarGaugeWithApy: GaugeWithApy[] | null };

export const useJarGaugeApy = (inputGauges: Input): Output => {
  const { jars } = Jars.useContainer();
  const { prices } = Prices.useContainer();

  const [farmData, setFarmData] = useState<any | null>(null);

  const [gauges, setGauges] = useState<GaugeWithApy[] | null>(null);

  const calculateApy = async (): Promise<void> => {
    if (!inputGauges || !prices || !jars || !farmData) {
      return;
    }
    const jarGauges = inputGauges.filter((gauge) => JAR_GAUGE_MAP[gauge.token]);

    const res = jarGauges.map((gauge, idx) => {
      const { jarName } = JAR_GAUGE_MAP[gauge.token];
      const gaugeingJar = jars.filter((x) => x.jarName === jarName)[0];
      // early return for gauges based on deactivated jars
      if (!gaugeingJar) {
        return {
          ...gauge,
          fullApy: 0,
          usdPerToken: 0,
          totalValue: 0,
          valueStakedInGauge: 0,
          numTokensInPool: 0,
        };
      }

      const farmInfo = Object.values(farmData).filter(
        (farm) => farm.address === gauge.token,
      );
      // calculate APY
      const isUsdc =
        gauge.token.toLowerCase() === PICKLE_JARS.pyUSDC.toLowerCase();
      const valueStakedInGauge = farmInfo.valueBalance;
      const fullApy = gaugeingJar.usdPerPToken
        ? (gauge.rewardRatePerYear * prices.pickle) /
          (gaugeingJar.usdPerPToken * (isUsdc ? 1e12 : 1))
        : 0;
      return {
        ...gauge,
        fullApy,
        usdPerToken: gaugeingJar.usdPerPToken || 0,
        totalValue: gaugeingJar.tvlUSD || 0,
        valueStakedInGauge,
        numTokensInPool: farmInfo.tokenBalance,
      };
    });

    setGauges(res);
  };

  useEffect(() => {
    const fetchFarmData = async () => setFarmData(await getFarmData());
    if (!farmData) fetchFarmData();
    calculateApy();
  }, [inputGauges]);

  return { jarGaugeWithApy: gauges };
};
