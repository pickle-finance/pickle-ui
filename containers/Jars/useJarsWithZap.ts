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

export interface TokenDetails {
  name: string;
  symbol: string;
  balance: BigNumber;
  decimals: number;
  allowance?: BigNumber;
}

export interface ZapDetails {
  swapProtocol: SwapProtocol;
  nativePath: {
    path: string[];
    target: string;
  };
  nativeTokenDetails: TokenDetails;
  // wrappedTokenDetails: TokenDetails;
  token0: TokenDetails;
  token1: TokenDetails;
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

        return {
          ...jar,
          zapDetails: {
            swapProtocol: swapProtocol,
            nativePath: found.depositToken.nativePath,
            nativeTokenDetails: {
              name: "Native",
              symbol: "NAT",
              balance: nativebal,
              decimals: 18,
            },
            token0: {
              name: name0,
              symbol: symbol0,
              balance: bal0,
              decimals: decimal0,
              allowance: allowance0,
            },
            token1: {
              name: name1,
              symbol: symbol1,
              balance: bal1,
              decimals: decimal1,
              allowance: allowance1,
            },
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
