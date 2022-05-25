import { ChainNetwork } from "picklefinance-core";

export const backgroundColor = "#fafafa";
export const pickleGreen = "#33691E";
export const pickleWhite = "#ebebeb";
export const pickleNeon = "#000000";
export const pickleNeonHover = "#26ff91";
export const cardColor = "#efefef";
export const graphFill = "#13854b";
export const pickleBlue = "#00ace6";
export const accentColor = "#26ff91";
export const materialBlack = "#292929";

export const normalize = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const noFarms = (chainName) =>
  chainName === ChainNetwork.OKEx ||
  chainName === ChainNetwork.Moonriver ||
  chainName === ChainNetwork.Cronos ||
  chainName === ChainNetwork.Moonbeam ||
  chainName === ChainNetwork.Optimism ||
  chainName === ChainNetwork.Fantom ||
  chainName === ChainNetwork.Gnosis;

export const neverExpireEpochTime = "33202513960";

export const someFarms = (chainName) => chainName === ChainNetwork.Metis;
