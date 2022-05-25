import { useState, useEffect } from "react";
import { Prices } from "../Prices";
import { GaugeWithApy } from "./useUniV2Apy";
import { GaugeWithReward } from "./useWithReward";
import { Jars } from "../Jars";
import { PickleCore } from "v1/containers/Jars/usePickleCore";
import { getFarmData } from "../../util/api";
import { useJarFarmMap } from "v1/containers/Farms/farms";
import { isPUsdcToken } from "../Jars/jars";
import { Connection } from "v1/containers/Connection";

// what comes in and goes out of this function
type Input = GaugeWithReward[] | null;
type Output = { jarGaugeWithApy: GaugeWithApy[] | null };

export const useJarGaugeApy = (inputGauges: Input): Output => {
  const { jars } = Jars.useContainer();
  const { prices } = Prices.useContainer();
  const { pickleCore } = PickleCore.useContainer();
  const { chainName } = Connection.useContainer();

  const [farmData, setFarmData] = useState<any | null>(null);

  const [gauges, setGauges] = useState<GaugeWithApy[] | null>(null);
  const jarFarmMap = useJarFarmMap();

  const calculateApy = () => {
    if (!inputGauges || !prices || !jars || !farmData || !chainName) {
      return;
    }
    const jarGauges = inputGauges.filter((gauge) => jarFarmMap[gauge.token]);

    const res = jarGauges.map((gauge, idx) => {
      const { jarName } = jarFarmMap[gauge.token];
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

      const farmInfo = Object.values(farmData).filter((farm) => farm.address === gauge.token);
      // calculate APY
      const valueStakedInGauge = farmInfo.valueBalance;
      const fullApy = gaugeingJar.usdPerPToken
        ? (gauge.rewardRatePerYear * prices.pickle) /
          (gaugeingJar.usdPerPToken * (isPUsdcToken(gauge.token) ? 1e12 : 1))
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
  }, [inputGauges, jars]);

  return { jarGaugeWithApy: gauges };
};
