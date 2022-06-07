import { useState, useEffect } from "react";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { BigNumber, ethers } from "ethers";
import { Balances } from "v1/containers/Balances";
import { ERC20Transfer } from "v1/containers/Erc20Transfer";
import { PickleCore } from "./usePickleCore";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { JarV3 } from "v1/containers/Jars/useJarsWithUniV3";
import { PickleZapV1 } from "../Contracts/PickleZapV1";
import { PickleZapV1__factory as pickleZapV1Factory } from "../Contracts/factories/PickleZapV1__factory";
import { UniswapRouter } from "../Contracts/UniswapRouter";
import { UniswapRouter__factory as uniswapRouterFactory } from "../Contracts/factories/UniswapRouter__factory";
import { ChainNetwork } from "picklefinance-core";

export interface TokenDetails {
  symbol: string;
  balance: BigNumber;
  decimals: number;
  address: string;
  isNative?: boolean;
  isWrapped?: boolean;
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
  const { blockNum, chainName, signer, address, provider, chainId } = Connection.useContainer();
  const { pickleCore } = PickleCore.useContainer();

  const { erc20 } = Contracts.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();
  const [jarsWithZap, setJarsWithZap] = useState<Array<JarZap> | null>(null);

  const fetchZapDetails = async () => {
    if (jars && signer && erc20 && address && pickleCore && provider) {
      const promises = jars.map(async (jar) => {
        const found: JarDefinition | undefined = pickleCore.assets.jars.find(
          (x) => x.details?.apiKey === jar.apiKey,
        );

        const swapProtocol = pickleCore.xykSwapProtocols.find((x) => {
          return x.protocol == jar.protocol && x.chain == chainName;
        });

        if (
          !found ||
          !found.depositToken.components ||
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
          return found.depositToken.components?.includes(token.id) && token.chain == chainName;
        });

        if (tokens.length === 0) {
          return {
            ...jar,
            zapDetails: null,
          };
        }

        const token0Address = tokens[0].contractAddr;
        const token1Address = tokens[1].contractAddr;
        const token0Decimals = tokens[0].decimals;
        const token1Decimals = tokens[1].decimals;
        const Token0 = erc20.attach(token0Address).connect(signer);
        const Token1 = erc20.attach(token1Address).connect(signer);

        const [bal0, bal1, symbol0, symbol1, nativebal] = await Promise.all([
          Token0.balanceOf(address),
          Token1.balanceOf(address),
          Token0.symbol(),
          Token1.symbol(),
          provider.getBalance(address),
        ]);

        const chainDetails = pickleCore.chains.find((x) => x.chainId === chainId);

        let inputTokens: Array<TokenDetails> = [];

        if (chainName != ChainNetwork.Metis) {
          inputTokens.push({
            symbol: `${chainDetails?.gasTokenSymbol.toUpperCase()} (Native)` || "NAT",
            balance: nativebal,
            decimals: 18,
            isNative: true,
            address: ethers.constants.AddressZero,
          });
        }

        const wrappedTokenAddress = chainDetails?.wrappedNativeAddress;

        if (
          wrappedTokenAddress &&
          ![token0Address.toLowerCase(), token1Address.toLowerCase()].includes(
            wrappedTokenAddress.toLowerCase(),
          )
        ) {
          const WrappedToken = erc20.attach(wrappedTokenAddress).connect(signer);

          const [wBal, wSym] = await Promise.all([
            WrappedToken.balanceOf(address),
            WrappedToken.symbol(),
          ]);

          inputTokens.push({
            symbol: wSym.toUpperCase(),
            balance: wBal,
            decimals: 18,
            address: wrappedTokenAddress,
            isWrapped: true,
          });
        }

        inputTokens = [
          ...inputTokens,
          {
            symbol: symbol0.toUpperCase(),
            balance: bal0,
            decimals: token0Decimals,
            address: Token0.address,
          },
          {
            symbol: symbol1.toUpperCase(),
            balance: bal1,
            decimals: token1Decimals,
            address: Token1.address,
          },
        ];

        return {
          ...jar,
          zapDetails: {
            zappable: swapProtocol.zappable,
            pickleZapContract: pickleZapV1Factory.connect(swapProtocol.pickleZapAddress, provider),
            router: uniswapRouterFactory.connect(swapProtocol.router, provider),
            nativePath: found.depositToken.nativePath,
            inputTokens,
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
