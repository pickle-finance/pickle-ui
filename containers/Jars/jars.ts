export const GET_FUCKED = "not here anymore";

import { PickleModelJson } from "picklefinance-core";
import {
  AssetEnablement,
  JarDefinition,
} from "picklefinance-core/lib/model/PickleModelJson";

const BALANCER_POOLS = [
  "0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac", // bal pickle-eth
  "0x64541216bafffeec8ea535bb71fbc927831d0595", // bal tricrypto
];

export const isBalancerPool = (depositTokenAddress: string) => {
  return BALANCER_POOLS.includes(depositTokenAddress.toLowerCase());
}

// pUSDC jar token
export const isPUsdcToken = (jarTokenAddress: string) => {
  return (
    jarTokenAddress.toLowerCase() ===
    "0xEB801AB73E9A2A482aA48CaCA13B1954028F4c94".toLowerCase()
  );
};

// Mainnet USDC token
export const isUsdcToken = (depositTokenAddress: string) => {
  return (
    depositTokenAddress.toLowerCase() ===
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase()
  );
};

export const isYveCrvEthJarToken = (jarTokenAddress: string) => {
  return (
    jarTokenAddress.toLowerCase() ===
    "0x5Eff6d166D66BacBC1BF52E2C54dD391AE6b1f48".toLowerCase()
  );
};

export const isQlpQiToken = (depositTokenAddress: string) => {
  return (
    depositTokenAddress.toLowerCase() ===
    "0x7AfcF11F3e2f01e71B7Cc6b8B5e707E42e6Ea397".toLowerCase()
  );
};

export const isQlpQiMaticOrUsdcToken = (depositTokenAddress: string) => {
  return (
    depositTokenAddress.toLowerCase() ===
      "0x9A8b2601760814019B7E6eE0052E25f1C623D1E6".toLowerCase() ||
    depositTokenAddress.toLowerCase() ===
      "0x160532d2536175d65c03b97b0630a9802c274dad".toLowerCase()
  );
};

export const isMainnetMimEthJarDepositToken = (depositToken: string) => {
  return (
    depositToken.toLowerCase() ===
    "0x993f35FaF4AEA39e1dfF28f45098429E0c87126C".toLowerCase()
  );
};

export const shouldJarBeInUi = (
  jarContractAddress: string,
  pfcore: PickleModelJson.PickleModelJson | null,
) => {
  return (
    isJarEnabled(jarContractAddress, pfcore) ||
    isJarDisabled(jarContractAddress, pfcore)
  );
};

export const isJarEnabled = (
  jarContractAddress: string,
  pfcore: PickleModelJson.PickleModelJson | null,
) => {
  if (!pfcore) return false;

  const found: JarDefinition | undefined = pfcore.assets.jars.find(
    (x) => x.contract.toLowerCase() === jarContractAddress.toLowerCase(),
  );
  if (found) {
    // TODO if you want to test dev-mode jars, change that here to include dev!
    if (found.enablement === AssetEnablement.ENABLED) {
      return true;
    }
  }
  return false;
};

// This will not show permanently-disabled jars
export const isJarDisabled = (
  jarContractAddress: string,
  pfcore: PickleModelJson.PickleModelJson | null,
) => {
  if (!pfcore) {
    return true;
  }
  const found: JarDefinition | undefined = pfcore.assets.jars.find(
    (x) => x.contract.toLowerCase() === jarContractAddress.toLowerCase(),
  );
  if (found) {
    if (found.enablement === AssetEnablement.DISABLED) {
      return true;
    }
  }
  return false;
};
