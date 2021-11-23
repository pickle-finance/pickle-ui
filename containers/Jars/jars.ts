export const GET_FUCKED = "not here anymore";

import { PickleModelJson } from "picklefinance-core";
import { AssetEnablement, JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { PickleCore } from "./usePickleCore";

// pUSDC jar token
export const isPUsdcToken = (jarTokenAddress: string) => {
    return jarTokenAddress.toLowerCase() === "0xEB801AB73E9A2A482aA48CaCA13B1954028F4c94".toLowerCase();
};

// Mainnet USDC token
export const isUsdcToken = (depositTokenAddress: string) => {
    return depositTokenAddress.toLowerCase() === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase();
};

export const isyveCrvEthJarToken = (jarTokenAddress: string) => {
    return jarTokenAddress.toLowerCase() === "0x5Eff6d166D66BacBC1BF52E2C54dD391AE6b1f48".toLowerCase();
}

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