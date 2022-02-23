import { useState, useEffect } from "react";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { BigNumber, ethers } from "ethers";
import { Balances } from "containers/Balances";
import { ERC20Transfer } from "containers/Erc20Transfer";
import { PickleCore } from "./usePickleCore";
import {
  JarDefinition,
  SwapProtocol,
} from "picklefinance-core/lib/model/PickleModelJson";
import { JarV3 } from "containers/Jars/useJarsWithUniV3";
import { PickleZapV1 } from "../Contracts/PickleZapV1";
import { PickleZapV1__factory as pickleZapV1Factory} from "../Contracts/factories/PickleZapV1__factory";
import { UniswapRouter } from "../Contracts/UniswapRouter";
import { UniswapRouter__factory as uniswapRouterFactory} from "../Contracts/factories/UniswapRouter__factory";

export interface TokenDetails {
  name: string;
  symbol: string;
  balance: BigNumber;
  decimals: number;
  address: string;
  allowance?: BigNumber;
  isNative?: boolean;
}

export interface ZapDetails {
  zappable: boolean;
  pickleZapContract: PickleZapV1;
  router: UniswapRouter;
  nativePath: {
    path: string[];
    target: string;
  };
  inputTokens: Array<TokenDetails>;
}

export interface JarZap extends JarV3 {
  zapDetails: ZapDetails | null;
}

export const useJarsWithZap = (
  jars: Array<JarV3> | null,
): { jarsWithZap: Array<JarZap> | null } => {
  const {
    blockNum,
    chainName,
    signer,
    address,
    provider,
    chainId,
  } = Connection.useContainer();
  const { pickleCore } = PickleCore.useContainer();

  const { erc20 } = Contracts.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();
  const [jarsWithZap, setJarsWithZap] = useState<Array<JarZap> | null>(null);

  const fetchZapDetails = async () => {
    if (jars && signer && erc20 && address && pickleCore && provider) {
      const promises = jars.map(async (jar) => {
        const found: JarDefinition | undefined = pickleCore.assets.jars.find(
          (x) => x.details.apiKey === jar.apiKey,
        );

        const swapProtocol = pickleCore.swapProtocols.find((x) => {
          return x.protocol == jar.protocol && x.chain == chainName;
        });

        if (
          !found ||
          !found.depositToken.components ||
          !found.depositToken.isSwapProtocol ||
          !swapProtocol ||
          !found.depositToken.nativePath ||
          !swapProtocol.zappable ||
          swapProtocol.router === "" ||
          swapProtocol.pickleZapAddress === ""
        ) {
          return {
            ...jar,
            zapDetails: null,
          };
        }

        const tokens = pickleCore.tokens.filter((token) => {
          return (
            found.depositToken.components?.includes(token.id) &&
            token.chain == chainName
          );
        });

        if (tokens.length === 0) {
          return {
            ...jar,
            zapDetails: null,
          };
        }

        const token0 = tokens[0].contractAddr;
        const token1 = tokens[1].contractAddr;

        const Token0 = erc20.attach(token0).connect(signer);
        const Token1 = erc20.attach(token1).connect(signer);

        // [TODO]: No need for fetching details if already fetched in v3
        const [
          bal0,
          bal1,
          allowance0,
          allowance1,
          decimal0,
          decimal1,
          name0,
          name1,
          symbol0,
          symbol1,
          nativebal,
        ] = await Promise.all([
          Token0.balanceOf(address),
          Token1.balanceOf(address),
          Token0.allowance(address, swapProtocol.pickleZapAddress),
          Token1.allowance(address, swapProtocol.pickleZapAddress),
          Token0.decimals(),
          Token1.decimals(),
          Token0.name(),
          Token1.name(),
          Token0.symbol(),
          Token1.symbol(),
          provider.getBalance(address),
        ]);

        const chainDetails = pickleCore.chains.find(x => x.chainId === chainId);

        return {
          ...jar,
          zapDetails: {
            zappable: swapProtocol.zappable,
            pickleZapContract: pickleZapV1Factory.connect(swapProtocol.pickleZapAddress, provider),
            router: uniswapRouterFactory.connect(swapProtocol.router, provider),
            nativePath: found.depositToken.nativePath,
            inputTokens: [
              {
                name: chainDetails?.gasToken || "Native",
                symbol: chainDetails?.gasTokenSymbol.toUpperCase() || "NAT",
                balance: nativebal,
                decimals: 18,
                isNative: true,
                address: ethers.constants.AddressZero,
              },
              {
                name: name0,
                symbol: symbol0,
                balance: bal0,
                decimals: decimal0,
                allowance: allowance0,
                address: Token0.address,
              },
              {
                name: name1,
                symbol: symbol1,
                balance: bal1,
                decimals: decimal1,
                allowance: allowance1,
                address: Token1.address,
              },
            ]
          },
        };
      });
      const newJars = await Promise.all(promises);
      setJarsWithZap(newJars);
    }
  };

  useEffect(() => {
    fetchZapDetails();
  }, [pickleCore, chainName, jars, blockNum, tokenBalances, transferStatus]);
  return { jarsWithZap };
};
