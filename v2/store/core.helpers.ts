import { ethers } from "ethers";
import {
  AssetEnablement,
  ExternalAssetDefinition,
  JarDefinition,
  NestedFarm,
  PickleModelJson,
  StandaloneFarmDefinition,
} from "picklefinance-core/lib/model/PickleModelJson";

import {
  AssetWithData,
  BrineryWithData,
  ExternalAssetWithData,
  JarWithData,
  StandaloneFarmWithData,
} from "./core";

export type Asset = JarDefinition | StandaloneFarmDefinition | ExternalAssetDefinition;

export const farmDetails = (asset: Asset | undefined): NestedFarm | undefined => {
  if (asset && "farm" in asset) return asset.farm;
};

export const isJar = (asset: Asset | undefined): asset is JarWithData => asset?.type === "jar";
export const isStandaloneFarm = (asset: Asset | undefined): asset is StandaloneFarmWithData =>
  asset?.type === "standalone_farm";
export const isExternalAsset = (asset: Asset | undefined): asset is ExternalAssetWithData =>
  asset?.type === "external";
export const isBrinery = (asset: Asset | undefined): asset is BrineryWithData =>
  asset?.type === "brinery";

export const jarSupportsStaking = (
  asset: AssetWithData | undefined,
): asset is JarWithData | ExternalAssetWithData => {
  if (asset == undefined) return false;
  if ("farm" in asset) {
    return asset.farm !== undefined && asset.farm.farmAddress !== ethers.constants.AddressZero;
  }

  return false;
};

export const allAssets = (core: PickleModelJson): Asset[] => [
  ...core.assets.jars,
  ...core.assets.standaloneFarms,
  ...core.assets.external,
];

export const findJar = (
  apiKey: string,
  core: PickleModelJson | undefined,
): JarDefinition | undefined => {
  if (!core) return;

  return core.assets.jars.find((jar) => jar.details?.apiKey.toUpperCase() === apiKey.toUpperCase());
};

export const findAsset = (apiKey: string, core: PickleModelJson): Asset | undefined => {
  const assets = allAssets(core);
  const asset = assets.find(
    (asset) => asset.details?.apiKey.toUpperCase() === apiKey.toUpperCase(),
  );

  return asset;
};

export const visibleStringForAsset = (
  apiKey: string,
  core: PickleModelJson,
): string | undefined => {
  const asset = findAsset(apiKey, core);

  return asset?.depositToken.name;
};

export const tokenDecimals = (apiKey: string | undefined, core: PickleModelJson): number => {
  if (!core || !apiKey) return 18;

  const token = core.tokens.find((token) => token.id.toUpperCase() === apiKey.toUpperCase());

  return token ? token.decimals : 18;
};

export const enabledPredicate = (asset: Asset) =>
  asset.enablement === AssetEnablement.ENABLED ||
  asset.enablement === AssetEnablement.WITHDRAW_ONLY;

export const isAcceptingDeposits = (asset: Asset) =>
  asset.enablement !== AssetEnablement.WITHDRAW_ONLY;
