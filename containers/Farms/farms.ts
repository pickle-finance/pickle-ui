import { PickleModelJson } from "picklefinance-core";
import { getAddress } from "@ethersproject/address";

export const PICKLE_ETH_FARM = "0xdc98556ce24f007a5ef6dc1ce96322d65832a819";

export interface FarmMap {
  [contract: string]: {
    jarName: string;
  };
}
export const getJarFarmMap = (
  pfcore: PickleModelJson.PickleModelJson | null,
): FarmMap => {
  if (!pfcore) {
    return {};
  }

  const ret: FarmMap = {};
  for (let i = 0; i < pfcore.assets.jars.length; i++) {
    if (
      pfcore.assets.jars[i].id !== undefined &&
      pfcore.assets.jars[i].contract !== undefined
    ) {
      ret[getAddress(pfcore.assets.jars[i].contract)] = {
        jarName: pfcore.assets.jars[i].id,
      };
    }
  }
  return ret;
};
