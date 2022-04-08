import { PickleModelJson } from "picklefinance-core";
import { RawChain } from "picklefinance-core/lib/chain/Chains";

export type Network = {
  name: string;
  visibleName: string;
  chainId: number;
};

export const getNetworks = (core: PickleModelJson.PickleModelJson | undefined): Network[] => {
  if (!core) return [];
  const chains: RawChain[] = [...core.chains].sort((first, second) =>
    first.network > second.network ? 1 : -1,
  );
  let returns: Network[] = [];
  for (let i = 0; i < chains.length; i++) {
    const name = chains[i].network;
    const visibleName = chains[i].networkVisible;
    returns.push({
      name,
      visibleName,
      chainId: chains[i].chainId,
    });
  }
  return returns;
};
