import { PickleModelJson } from "picklefinance-core";
import { getAddress } from "@ethersproject/address";
import { Connection } from "v1/containers/Connection";
import { PickleCore } from "v1/containers/Jars/usePickleCore";
import { useEffect, useState } from "react";

export const PICKLE_ETH_FARM = "0xdc98556ce24f007a5ef6dc1ce96322d65832a819";

export interface FarmMap {
  [contract: string]: {
    jarName: string | null;
  };
}
export const useJarFarmMap = (): FarmMap => {
  const { pickleCore } = PickleCore.useContainer();
  const { chainName } = Connection.useContainer();
  const [jarFarmMap, setJarFarmMap] = useState<FarmMap>({});

  const getJarFarmMap = async () => {
    if (!pickleCore || !chainName) {
      setJarFarmMap({});
      return;
    }

    const ret: FarmMap = {};
    for (let i = 0; i < pickleCore.assets.jars.length; i++) {
      if (
        pickleCore.assets.jars[i].id !== undefined &&
        pickleCore.assets.jars[i].contract !== undefined &&
        pickleCore.assets.jars[i].chain == chainName
      ) {
        ret[getAddress(pickleCore.assets.jars[i].contract)] = {
          jarName: pickleCore.assets.jars[i].id,
        };
      }
    }
    setJarFarmMap(ret);
  };

  useEffect(() => {
    getJarFarmMap();
  }, [pickleCore, chainName]);
  return jarFarmMap;
};
