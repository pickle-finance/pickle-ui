import { useState, useEffect } from "react";
import { JarV3__factory as JarV3Factory } from "v1/containers/Contracts/factories/JarV3__factory";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { BigNumber, ethers } from "ethers";
import { JarWithAPY as JarWithTVL } from "./useJarsWithAPYPFCore";
import { Balances } from "v1/containers/Balances";
import { ERC20Transfer } from "v1/containers/Erc20Transfer";
import { PickleCore } from "./usePickleCore";
import {
  JarDefinition,
  AssetProtocol,
  PickleAsset,
  IExternalToken,
} from "picklefinance-core/lib/model/PickleModelJson";
import { PickleModelJson } from "picklefinance-core";

export interface UniV3Token {
  address: string;
  walletBalance: BigNumber;
  jarAmount: number;
  approved: boolean;
  name: string;
  decimals: number;
}

export interface JarV3 extends JarWithTVL {
  token0: UniV3Token | null;
  token1: UniV3Token | null;
  proportion: BigNumber | null;
}

export const getComponentTokenAddresses = (
  pickleCore: PickleModelJson.PickleModelJson | null | undefined,
  definition: PickleAsset,
): string[] | undefined => {
  if (pickleCore === undefined || pickleCore === null) return [];
  const components = definition.depositToken.components || [];
  const addresses: string[] = [];
  for (let i = 0; i < components.length; i++) {
    const found: IExternalToken | undefined = pickleCore.tokens.find(
      (x) => x.chain === definition.chain && x.id === components[i],
    );
    if (!found) {
      return undefined;
    }
    addresses.push(found.contractAddr);
  }
  return addresses;
};

export const useJarsWithUniV3 = (
  jars: Array<JarWithTVL> | null,
): { jarsWithV3: Array<JarV3> | null } => {
  const { blockNum, chainName, signer, address } = Connection.useContainer();
  const { pickleCore } = PickleCore.useContainer();

  const { erc20 } = Contracts.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();
  const [jarsWithV3, setJarsWithV3] = useState<Array<JarV3> | null>(null);

  const fetchUniV3 = async () => {
    if (jars && signer && erc20 && address && pickleCore) {
      const promises = jars.map(async (jar) => {
        const returnError = {
          ...jar,
          token0: null,
          token1: null,
          proportion: null,
        };
        const found: JarDefinition | undefined = pickleCore.assets.jars.find(
          (x) => x.details?.apiKey === jar.apiKey,
        );
        if (
          !found ||
          !found.depositToken.componentTokens ||
          !found.depositToken.components ||
          found?.protocol !== AssetProtocol.UNISWAP_V3 ||
          getComponentTokenAddresses(pickleCore, found) === undefined
        ) {
          return returnError;
        }

        const jarV3 = JarV3Factory.connect(jar.contract.address, signer);
        const componentAddressArray = getComponentTokenAddresses(pickleCore, found);
        if (componentAddressArray === undefined || componentAddressArray.length !== 2)
          return returnError;

        const token0 = componentAddressArray[0];
        const token1 = componentAddressArray[1];

        const Token0 = erc20.attach(token0).connect(signer);
        const Token1 = erc20.attach(token1).connect(signer);

        const jarV3Contract = JarV3Factory.connect(jar.contract.address, signer);

        const [
          bal0,
          bal1,
          allowance0,
          allowance1,
          token0Decimals,
          token1Decimals,
          proportion,
        ] = await Promise.all([
          getBalance(token0),
          getBalance(token1),
          Token0.allowance(address, jar.contract.address),
          Token1.allowance(address, jar.contract.address),
          Token0.decimals(),
          Token1.decimals(),
          jarV3.getProportion().catch(() => BigNumber.from(0)),
        ]);

        return {
          ...jar,
          contract: jarV3Contract,
          token0: {
            address: token0,
            walletBalance: bal0,
            jarAmount: found.depositToken.componentTokens[0],
            approved: allowance0.gt(ethers.constants.Zero),
            name: found.depositToken.components[0],
            decimals: token0Decimals,
          },
          token1: {
            address: token1,
            walletBalance: bal1,
            jarAmount: found.depositToken.componentTokens[1],
            approved: allowance1.gt(ethers.constants.Zero),
            name: found.depositToken.components[1],
            decimals: token1Decimals,
          },
          proportion,
        };
      });
      const newJars = await Promise.all(promises);
      setJarsWithV3(newJars);
    }
  };
  useEffect(() => {
    fetchUniV3();
  }, [pickleCore, chainName, jars, blockNum, tokenBalances, transferStatus]);
  return { jarsWithV3 };
};
