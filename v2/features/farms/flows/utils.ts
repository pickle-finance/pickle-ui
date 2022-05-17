import { Web3Provider } from "@ethersproject/providers";
import { ethers, Event } from "ethers";
import { PickleAsset } from "picklefinance-core/lib/model/PickleModelJson";
import { Network } from "v2/features/connection/networks";

export const getNativeName = (token: string): string => {
  const startsWithW = token.charAt(0).toLowerCase() === "w";
  const nativeName = startsWithW ? token.substring(1).toUpperCase() : token.toUpperCase();
  return nativeName;
};

export const eventsByName = <T extends Event>(receipt: ethers.ContractReceipt, name: string): T[] =>
  receipt.events?.filter(({ event }) => event === name) as T[];

export const formatImagePath = (chain: string, networks: Network[] | undefined): string => {
  const thisNetwork = networks?.find((network) => network.name === chain);
  if (thisNetwork) {
    return `/networks/${thisNetwork.name}.png`;
  } else {
    return "/pickle.png";
  }
};

export const metamaskAdd = async (asset: PickleAsset, library: Web3Provider | undefined) => {
  const tokenAddress = asset.contract;
  const tokenSymbol = `p${asset.depositToken.name.replace(/[\s\/-]/g, "").substring(0, 10)}`;
  const tokenDecimals = 18;
  const tokenImage = new URL("/tokens/pickle.png", document.baseURI).href;

  if (library?.provider.request !== undefined) {
    try {
      // Returns a boolean. Like any RPC method, an error may be thrown.
      await library.provider.request({
        method: "wallet_watchAsset",
        params: {
          // @ts-ignore
          // https://github.com/ethers-io/ethers.js/issues/2576
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });
    } catch (error) {}
  }
};
