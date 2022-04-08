import { createContainer } from "unstated-next";
import { Connection } from "./Connection";
import { useFetchFarms } from "./Farms/useFetchFarms";
import { useWithReward } from "./Farms/useWithReward";
import { ChainNetwork, Chains, PickleModelJson } from "picklefinance-core";
import { PickleCore } from "./Jars/usePickleCore";

export const createIFarmInfo = (pfcore: PickleModelJson.PickleModelJson | null): any => {
  if (!pfcore) {
    return {};
  }

  const ret: any = {};
  pfcore.chains.map((chain) => {
    ret[chain.network] = {};
  });
  for (let i = 0; i < pfcore.assets.jars.length; i++) {
    if (pfcore.assets.jars[i].id !== undefined && pfcore.assets.jars[i].contract !== undefined) {
      const tName = pfcore.assets.jars[i].farm
        ? pfcore.assets.jars[i].farm!.farmDepositTokenName
        : pfcore.assets.jars[i].depositToken.name;
      const r = {
        tokenName: tName,
        poolName: pfcore.assets.jars[i].depositToken.name,
      };
      ret[pfcore.assets.jars[i].chain][pfcore.assets.jars[i].depositToken.addr.toLowerCase()] = r;
      ret[pfcore.assets.jars[i].chain][pfcore.assets.jars[i].contract.toLowerCase()] = r;
    }
  }
  ret[ChainNetwork.Ethereum]["0xdc98556Ce24f007A5eF6dC1CE96322d65832A819".toLowerCase()] = {
    tokenName: "UNI PICKLE/ETH",
    poolName: "Pickle Power",
  };
  return ret;
};

function useFarms() {
  const { chainId } = Connection.useContainer();
  const { rawFarms } = useFetchFarms();
  const { farmsWithReward } = useWithReward(rawFarms);
  const { pickleCore } = PickleCore.useContainer();
  const chain = pickleCore?.chains.find((x) => x.chainId === chainId)?.network!;

  // const { uniV2FarmsWithApy } = useUniV2Apy(farmsWithReward);
  // const { jarFarmWithApy } = useJarFarmApy(farmsWithReward)

  const farms = farmsWithReward
    ?.filter(
      (x) =>
        x.lpToken != "0x73feA839bEad0E4100B6e5f59Fb6E896Ad69910f" &&
        x.lpToken != "0x45F7fa97BD0e0C212A844BAea35876C7560F465B",
    )
    .map((farm) => {
      const farmInfo = createIFarmInfo(pickleCore)[chain][farm.lpToken];
      const tokenName = farmInfo?.tokenName || "";
      const poolName = farmInfo?.poolName || "";

      return {
        ...farm,
        tokenName,
        poolName,
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
