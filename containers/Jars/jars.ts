export const GET_FUCKED = "not here anymore";

import { PickleModelJson } from "picklefinance-core";
import { AssetEnablement, JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { PickleCore } from "./usePickleCore";

export const isUsdc = (jarTokenAddress: string) => {
    return jarTokenAddress.toLowerCase() === "0xEB801AB73E9A2A482aA48CaCA13B1954028F4c94".toLowerCase();
};


export const isJarEnabled = (jarContractAddress: string, pfcore: PickleModelJson.PickleModelJson | null) => {
  if( !pfcore ) 
    return false;

  const found : JarDefinition | undefined = pfcore.assets.jars.find((x)=>x.contract.toLowerCase() === jarContractAddress.toLowerCase());
  if( found ) {
    // TODO if you want to test dev-mode jars, change that here to include dev!
    if( found.enablement === AssetEnablement.ENABLED) {
      return true;
    }
  }
  return false;
};


// This will not show permanently-disabled jars
export const isJarDisabled = (jarContractAddress: string, pfcore: PickleModelJson.PickleModelJson | null) => {
  if( !pfcore ) {
    return true;
  }
  const found : JarDefinition | undefined = pfcore.assets.jars.find((x)=>x.contract.toLowerCase() === jarContractAddress.toLowerCase());
  if( found ) {
    // TODO if you want to test dev-mode jars, change that here to include dev!
    if( found.enablement === AssetEnablement.DISABLED) {
      return true;
    }
  }
  return false;
};