import { createContainer } from "unstated-next";

import { useFetchGauges } from "./Gauges/useFetchGauges";
import { useWithReward } from "./Gauges/useWithReward";
import { useUniV2Apy } from "./Gauges/useUniV2Apy";
import { useJarGaugeApy } from "./Gauges/useJarGaugeApy";
import { PickleCore } from "./Jars/usePickleCore";
import { createIFarmInfo } from "./Farms";

function useGauges() {
  const { pickleCore } = PickleCore.useContainer();
  const { rawGauges } = useFetchGauges();
  const { gaugesWithReward } = useWithReward(rawGauges);
  const { uniV2GaugesWithApy } = useUniV2Apy(gaugesWithReward);
  const { jarGaugeWithApy } = useJarGaugeApy(gaugesWithReward);
  const ifarmInfo = createIFarmInfo(pickleCore);
  const uniGauges = uniV2GaugesWithApy?.map((gauge) => {
    if (ifarmInfo[gauge?.token.toLowerCase()]) {
      const { tokenName, poolName } = ifarmInfo[gauge.token.toLowerCase()];
      return {
        ...gauge,
        tokenName,
        poolName,
      };
    }
  });
  const jarGauges2 = jarGaugeWithApy?.map((gauge) => {
    if (ifarmInfo[gauge?.token.toLowerCase()]) {
      const { tokenName, poolName } = ifarmInfo[gauge.token.toLowerCase()];
      return {
        ...gauge,
        tokenName,
        poolName,
      };
    } else {
      console.log(
        "FIXME: token " + gauge.token.toLowerCase() + " MISSING in gaugeInfo",
      );
      return undefined;
    }
  });
  const jarGauges = jarGauges2
    ? jarGauges2.filter((x) => x !== undefined && x !== null)
    : [];
  const gauges = uniGauges && jarGauges ? [...uniGauges, ...jarGauges] : null;

  return {
    gauges,
  };
}

export const Gauges = createContainer(useGauges);
