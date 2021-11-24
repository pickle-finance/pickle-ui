import { createContainer } from "unstated-next";

import { useFetchGauges } from "./Gauges/useFetchGauges";
import { useWithReward } from "./Gauges/useWithReward";
import { useUniV2Apy } from "./Gauges/useUniV2Apy";
import { useJarGaugeApy } from "./Gauges/useJarGaugeApy";
import { FarmInfo } from "./Farms";

export const GaugeInfo = FarmInfo;

function useGauges() {
  console.log("useGauges 1");
  const { rawGauges } = useFetchGauges();
  console.log("useGauges 2: " + rawGauges);
  const { gaugesWithReward } = useWithReward(rawGauges);
  console.log("useGauges 3: " + gaugesWithReward);
  const { uniV2GaugesWithApy } = useUniV2Apy(gaugesWithReward);
  console.log("useGauges 4: " + uniV2GaugesWithApy);
  const { jarGaugeWithApy } = useJarGaugeApy(gaugesWithReward);
  console.log("useGauges 5: " + jarGaugeWithApy);
  const uniGauges = uniV2GaugesWithApy?.map((gauge) => {
    const { tokenName, poolName } = GaugeInfo[gauge.token];
    return {
      ...gauge,
      tokenName,
      poolName,
    };
  });
  console.log("useGauges 6");

  console.log("Inside gauges.ts: " + jarGaugeWithApy);
  console.log("Inside gauges.ts: " + (jarGaugeWithApy ? jarGaugeWithApy.length : "null"));
  
  const jarGauges2 = jarGaugeWithApy?.map((gauge) => {
    console.log("Gauge Token: " + gauge.token);
    if( gauge.token ) {
      if( GaugeInfo[gauge.token] ) {
        const { tokenName, poolName } = GaugeInfo[gauge.token];
        return {
          ...gauge,
          tokenName,
          poolName,
        };
      } else {
        console.log("FIXME: token " + gauge.token + " MISSING in gaugeInfo");
        return undefined;
      }
    }
  });
  const jarGauges = jarGauges2 ? jarGauges2.filter((x) => x !== undefined && x !== null) : [];
  const gauges = uniGauges && jarGauges ? [...uniGauges, ...jarGauges] : null;

  return {
    gauges,
  };
}

export const Gauges = createContainer(useGauges);
