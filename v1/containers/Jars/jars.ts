export const GET_FUCKED = "not here anymore";

import { PickleModelJson } from "picklefinance-core";
import { AssetEnablement, JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";

// pUSDC jar token
export const isPUsdcToken = (jarTokenAddress: string) => {
  return (
    jarTokenAddress.toLowerCase() === "0xEB801AB73E9A2A482aA48CaCA13B1954028F4c94".toLowerCase()
  );
};

// Mainnet USDC token
export const isUsdcToken = (depositTokenAddress: string) => {
  return (
    depositTokenAddress.toLowerCase() === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase()
  );
};

export const isYveCrvEthJarToken = (jarTokenAddress: string) => {
  return (
    jarTokenAddress.toLowerCase() === "0x5Eff6d166D66BacBC1BF52E2C54dD391AE6b1f48".toLowerCase()
  );
};

export const isLooksJar = (depositTokenAddress: string) => {
  return depositTokenAddress.toLowerCase() === "0xf4d2888d29d722226fafa5d9b24f9164c092421e";
};

export const isQlpQiToken = (depositTokenAddress: string) => {
  return (
    depositTokenAddress.toLowerCase() === "0x7AfcF11F3e2f01e71B7Cc6b8B5e707E42e6Ea397".toLowerCase()
  );
};

export const isCroToken = (depositTokenAddress: string) => {
  return (
    depositTokenAddress.toLowerCase() === "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23".toLowerCase()
  );
};

export const isQlpQiMaticOrUsdcToken = (depositTokenAddress: string) => {
  return (
    depositTokenAddress.toLowerCase() ===
      "0x9A8b2601760814019B7E6eE0052E25f1C623D1E6".toLowerCase() ||
    depositTokenAddress.toLowerCase() === "0x160532d2536175d65c03b97b0630a9802c274dad".toLowerCase()
  );
};

export const isMainnetMimEthJarDepositToken = (depositToken: string) => {
  return depositToken.toLowerCase() === "0x993f35FaF4AEA39e1dfF28f45098429E0c87126C".toLowerCase();
};

export const shouldJarBeInUi = (
  jar: JarDefinition,
  pfcore: PickleModelJson.PickleModelJson | null,
) => {
  return isJarActive(jar.details?.apiKey, pfcore) || isJarDisabled(jar.details?.apiKey, pfcore);
};

/**
 * Should this jar appear in the 'enabled' section of the UI
 * @param jarApiKey
 * @param pfcore
 * @returns
 */
export const isJarActive = (jarApiKey: string, pfcore: PickleModelJson.PickleModelJson | null) => {
  return (
    checkJarEnablement(AssetEnablement.ENABLED, jarApiKey, pfcore) ||
    checkJarEnablement(AssetEnablement.WITHDRAW_ONLY, jarApiKey, pfcore)
  );
};

export const isJarWithdrawOnly = (
  jarApiKey: string,
  pfcore: PickleModelJson.PickleModelJson | null,
) => {
  return checkJarEnablement(AssetEnablement.WITHDRAW_ONLY, jarApiKey, pfcore);
};

/**
 * Should this jar appear in the 'Inactive Jars' section of the UI
 * This will not show permanently-disabled jars
 * @param jarApiKey
 * @param pfcore
 * @returns
 */
export const isJarDisabled = (
  jarApiKey: string,
  pfcore: PickleModelJson.PickleModelJson | null,
) => {
  return checkJarEnablement(AssetEnablement.DISABLED, jarApiKey, pfcore);
};

export const checkJarEnablement = (
  desired: AssetEnablement,
  jarApiKey: string,
  pfcore: PickleModelJson.PickleModelJson | null,
) => {
  if (!pfcore) {
    return true;
  }
  const found: JarDefinition | undefined = pfcore.assets.jars.find(
    (x) => x.details?.apiKey === jarApiKey,
  );
  if (found) {
    if (found.enablement === desired) {
      return true;
    }
  }
  return false;
};
