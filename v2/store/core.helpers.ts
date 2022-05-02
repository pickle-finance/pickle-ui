import { ethers } from "ethers";
import {
  AssetEnablement,
  ExternalAssetDefinition,
  JarDefinition,
  NestedFarm,
  PickleModelJson,
  StandaloneFarmDefinition,
} from "picklefinance-core/lib/model/PickleModelJson";

import { JarWithData } from "./core";

export type Asset = JarDefinition | StandaloneFarmDefinition | ExternalAssetDefinition;

export const farmDetails = (asset: Asset | undefined): NestedFarm | undefined => {
  if (asset && "farm" in asset) return asset.farm;
};

export const jarSupportsStaking = (jar: JarWithData): boolean => {
  const { farm } = jar;

  if (!farm) return false;

  return farm.farmAddress !== ethers.constants.AddressZero;
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
