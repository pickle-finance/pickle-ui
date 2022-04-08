import { createContainer } from "unstated-next";
import { Connection } from "./Connection";
import { useWithReward } from "./MiniFarms/useWithReward";
import { useJarFarmApy } from "./Farms/useJarFarmApy";
import { useFetchFarms } from "./Farms/useFetchFarms";
import { useMaticJarApy } from "./MiniFarms/useMaticJarApy";
import { PickleCore } from "./Jars/usePickleCore";
import { createIFarmInfo } from "./Farms";

function useFarms() {
  const { chainId } = Connection.useContainer();
  const { rawFarms } = useFetchFarms();
  const { farmsWithReward } = useWithReward(rawFarms);
  const { jarFarmWithApy } = useJarFarmApy(farmsWithReward);
  const { jarFarmWithMaticApy } = useMaticJarApy(jarFarmWithApy);
  const { pickleCore } = PickleCore.useContainer();

  const chain = pickleCore?.chains.find((x) => x.chainId === chainId)?.network!;

  const jarFarms = jarFarmWithMaticApy
    ?.map((farm) => {
      const ifarmInfo = createIFarmInfo(pickleCore);
      if (!ifarmInfo[chain][farm.lpToken.toLowerCase()]) return null;

      const { tokenName, poolName } = ifarmInfo[chain][farm.lpToken.toLowerCase()];
      return {
        ...farm,
        tokenName,
        poolName,
      };
    })
    .filter((x) => x);

  return {
    farms: jarFarms,
  };
}

export const MiniFarms = createContainer(useFarms);
