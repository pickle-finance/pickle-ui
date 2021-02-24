import { createContainer } from "unstated-next";

import { useFetchGauges } from "./Gauges/useFetchGauges";
import { useWithReward } from "./Gauges/useWithReward";
import { useUniV2Apy } from "./Gauges/useUniV2Apy";
import { useJarGaugeApy } from "./Gauges/useJarGaugeApy";

interface IGaugeInfo {
  [key: string]: { tokenName: string; poolName: string };
}

export const GaugeInfo: IGaugeInfo = {
  "0xdc98556Ce24f007A5eF6dC1CE96322d65832A819": {
    tokenName: "UNI PICKLE/ETH",
    poolName: "Pickle Power",
  },
};

function useGauges() {
  const { rawGauges } = useFetchGauges();
  const { gaugesWithReward } = useWithReward(rawGauges);
  const { uniV2GaugesWithApy } = useUniV2Apy(gaugesWithReward);
  const { jarGaugeWithApy } = useJarGaugeApy(gaugesWithReward);

  console.log("uniV2GaugesWithApy", rawGauges);

  const uniGauges = uniV2GaugesWithApy?.map((gauge) => {
    console.log(gauge.token);
    const { tokenName, poolName } = GaugeInfo[gauge.token];
    return {
      ...gauge,
      tokenName,
      poolName,
    };
  });

  const jarGauges = jarGaugeWithApy?.map((gauge) => {
    const { tokenName, poolName } = GaugeInfo[gauge.token];
    return {
      ...gauge,
      tokenName,
      poolName,
    };
  });

  return {
    gauges: uniGauges && jarGauges ? [...uniGauges, ...jarGauges] : null,
  };
}

export const Gauges = createContainer(useGauges);
