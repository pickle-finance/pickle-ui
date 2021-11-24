import { createContainer } from "unstated-next";

import { useFetchFarms } from "./Farms/useFetchFarms";
import { useWithReward } from "./Farms/useWithReward";
import { useUniV2Apy } from "./Farms/useUniV2Apy";
import { useJarFarmApy } from "./Farms/useJarFarmApy";
import { PickleCore } from "./Jars/usePickleCore";
import { spreadFarmNameToObject } from "./MiniFarms";
function useFarms() {
  const { rawFarms } = useFetchFarms();
  const { farmsWithReward } = useWithReward(rawFarms);
  // const { uniV2FarmsWithApy } = useUniV2Apy(farmsWithReward);
  // const { jarFarmWithApy } = useJarFarmApy(farmsWithReward)

  const farms = farmsWithReward
    ?.filter(
      (x) =>
        x.lpToken != "0x73feA839bEad0E4100B6e5f59Fb6E896Ad69910f" &&
        x.lpToken != "0x45F7fa97BD0e0C212A844BAea35876C7560F465B",
    )
    .map((farm) => {
      //const { tokenName, poolName } = FarmInfo[farm.lpToken];
      return {
        ...farm,
        //tokenName,
        //poolName,
        apy: 0,
        usdPerToken: 0,
        totalValue: 0,
        valueStakedInFarm: 0,
        numTokensInPool: 0,
      };
    });

  return {
    farms,
  };
}

export const Farms = createContainer(useFarms);
