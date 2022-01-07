import { useState, useEffect } from "react";
import { JarV3__factory as JarV3Factory } from "containers/Contracts/factories/JarV3__factory";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { BigNumber, ethers } from "ethers";
import { JarWithTVL } from "./useJarsWithTVL";
import { Balances } from "containers/Balances";
import { ERC20Transfer } from "containers/Erc20Transfer";
import { PickleCore } from "./usePickleCore";
import {
  JarDefinition,
  AssetProtocol,
} from "picklefinance-core/lib/model/PickleModelJson";

export interface UniV3Token {
  address: string;
  walletBalance: BigNumber;
  jarAmount: number;
  approved: boolean;
  name: string;
}

export interface JarV3 extends JarWithTVL {
  token0: UniV3Token | null;
  token1: UniV3Token | null;
  proportion: BigNumber | null;
}

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
        const found: JarDefinition | undefined = pickleCore.assets.jars.find(
          (x) => x.details.apiKey === jar.apiKey,
        );
        if (
          !found ||
          !found.depositToken.componentAddresses ||
          !found.depositToken.componentTokens ||
          !found.depositToken.components ||
          found?.protocol != AssetProtocol.UNISWAP_V3
        ) {
          return {
            ...jar,
            token0: null,
            token1: null,
            proportion: null,
          };
        }

        const jarV3 = JarV3Factory.connect(jar.contract.address, signer);

        const token0 = found.depositToken.componentAddresses[0];
        const token1 = found.depositToken.componentAddresses[1];

        const [bal0, bal1, proportion] = await Promise.all([
          getBalance(token0),
          getBalance(token1),
          jarV3.getProportion(),
        ]);

        // Check token approvals
        const Token0 = erc20.attach(token0).connect(signer);
        const Token1 = erc20.attach(token1).connect(signer);
        const allowance0 = await Token0.allowance(
          address,
          jar.contract.address,
        );
        const allowance1 = await Token1.allowance(
          address,
          jar.contract.address,
        );

        const jarV3Contract = JarV3Factory.connect(
          jar.contract.address,
          signer,
        );

        return {
          ...jar,
          contract: jarV3Contract,
          token0: {
            address: token0,
            walletBalance: bal0,
            jarAmount: found.depositToken.componentTokens[0],
            approved: allowance0.gt(ethers.constants.Zero),
            name: found.depositToken.components[0],
          },
          token1: {
            address: token1,
            walletBalance: bal1,
            jarAmount: found.depositToken.componentTokens[1],
            approved: allowance1.gt(ethers.constants.Zero),
            name: found.depositToken.components[1],
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
