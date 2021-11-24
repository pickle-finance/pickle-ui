import { createContainer } from "unstated-next";

import { useFetchGauges } from "./Gauges/useFetchGauges";
import { useWithReward } from "./Gauges/useWithReward";
import { useUniV2Apy } from "./Gauges/useUniV2Apy";
import { useJarGaugeApy } from "./Gauges/useJarGaugeApy";
import { PickleCore } from "./Jars/usePickleCore";
import { spreadFarmNameToObject } from "./MiniFarms";

function useGauges() {
  const { rawGauges } = useFetchGauges();
  const { gaugesWithReward } = useWithReward(rawGauges);
  const { uniV2GaugesWithApy } = useUniV2Apy(gaugesWithReward);
  const { jarGaugeWithApy } = useJarGaugeApy(gaugesWithReward);
  const { pickleCore } = PickleCore.useContainer();
  const uniGauges = uniV2GaugesWithApy?.map((gauge) => {
    return {
      ...gauge,
      //tokenName,
      //poolName,
    };
  });
  console.log("useGauges 6");

  console.log("Inside gauges.ts: " + jarGaugeWithApy);
  console.log("Inside gauges.ts: " + (jarGaugeWithApy ? jarGaugeWithApy.length : "null"));
  
  const jarGauges2 = jarGaugeWithApy?.map((gauge) => {
    console.log("Gauge Token: " + gauge.token);
    if( gauge.token ) {
        return {
          ...gauge,
//          tokenName,
//          poolName,
        };
      } else {
        console.log("FIXME: token " + gauge.token + " MISSING in gaugeInfo");
        return undefined;
      }
  });
  const jarGauges = jarGauges2 ? jarGauges2.filter((x) => x !== undefined && x !== null) : [];
  const gauges = uniGauges && jarGauges ? [...uniGauges, ...jarGauges] : null;

  return {
    gauges,
  };
}

export const Gauges = createContainer(useGauges);
