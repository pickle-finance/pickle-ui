import { getAddress } from "ethers/lib/utils";
import { ChainNetwork, Chains } from "picklefinance-core";
import { NULL_ADDRESS } from "picklefinance-core/lib/model/PickleModel";
import {
  AssetProtocol,
  PickleAsset,
  IExternalToken,
  PickleModelJson,
} from "picklefinance-core/lib/model/PickleModelJson";
import { UniV3Token } from "v2/store/core";
import { Asset } from "v2/store/core.helpers";

export const getComponentTokenAddresses = (
  pickleCore: PickleModelJson,
  definition: PickleAsset,
): IExternalToken[] | undefined => {
  const components = definition.depositToken.components || [];
  const addresses: IExternalToken[] = [];
  for (let i = 0; i < components.length; i++) {
    const found: IExternalToken | undefined = pickleCore.tokens.find(
      (x) => x.chain === definition.chain && x.id === components[i],
    );
    if (!found) {
      return undefined;
    }
    addresses.push(found);
  }
  return addresses;
};

export const getUniV3Tokens = (
  jar: Asset,
  pickleCore: PickleModelJson | undefined,
): Array<UniV3Token | undefined> => {
  if (
    pickleCore === undefined ||
    !jar.depositToken?.components?.length ||
    jar.protocol !== AssetProtocol.UNISWAP_V3
  )
    return [undefined, undefined];

  const componentAddressArray = getComponentTokenAddresses(pickleCore, jar);
  if (componentAddressArray === undefined || componentAddressArray.length !== 2)
    return [undefined, undefined];

  const token0 = convert(componentAddressArray[0], pickleCore, jar.chain);
  const token1 = convert(componentAddressArray[1], pickleCore, jar.chain);

  return [token0, token1];
};

const convert = (
  token: IExternalToken,
  pickleCore: PickleModelJson,
  chain: ChainNetwork,
): UniV3Token => {
  const isNative =
    getAddress(token.contractAddr) ===
    getAddress(
      pickleCore.chains.find((x) => x.network === chain)?.wrappedNativeAddress || NULL_ADDRESS,
    );
  return {
    address: token.contractAddr,
    approved: false,
    name: token.id,
    decimals: token.decimals,
    isNative,
  };
};
