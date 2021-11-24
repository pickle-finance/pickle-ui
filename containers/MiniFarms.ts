import { createContainer } from "unstated-next";

import { useWithReward } from "./MiniFarms/useWithReward";
import { useJarFarmApy } from "./Farms/useJarFarmApy";
import { useFetchFarms } from "./Farms/useFetchFarms";
import { useMaticJarApy } from "./MiniFarms/useMaticJarApy";
import { PickleCore } from "./Jars/usePickleCore";
import { JarDefinition, StandaloneFarmDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { PickleModelJson } from "picklefinance-core";

function useFarms() {
  const { rawFarms } = useFetchFarms();
  const { farmsWithReward } = useWithReward(rawFarms);
  const { jarFarmWithApy } = useJarFarmApy(farmsWithReward);
  const { jarFarmWithMaticApy } = useMaticJarApy(jarFarmWithApy);
  const { pickleCore } = PickleCore.useContainer();

  const jarFarms = jarFarmWithMaticApy
    ?.map((farm) => {
      return {
        ...farm,
        //tokenName,
        //poolName,
      };
    })
    .filter((x) => x);

    console.log("MiniFarms.ts length: " + jarFarms?.length);
  return {
    farms: jarFarms,
  };
}
export const spreadFarmNameToObject = (pfcore: PickleModelJson.PickleModelJson|null, original: any, token: string) : any => {
  console.log("Inside spread farm name to object for token " + token);
  const foundJar : JarDefinition | undefined = pfcore?.assets.jars.find((x)=>x.contract.toLowerCase() === token.toLowerCase());
  const foundFarm : StandaloneFarmDefinition | undefined = pfcore?.assets.standaloneFarms.find((x)=>x.depositToken.addr.toLowerCase() === token.toLowerCase());
  if( foundJar ) {
    const tokenName = 'p' + foundJar.depositToken.name;
    const poolName = tokenName;
    return {
      ...original,
      tokenName,
      poolName,
    };
  } else if( foundFarm ) {
    const tokenName = foundFarm.depositToken.name;
    const poolName = tokenName;
    return {
      ...original,
      tokenName,
      poolName,
    };
  }
  return original;
};

export const MiniFarms = createContainer(useFarms);
