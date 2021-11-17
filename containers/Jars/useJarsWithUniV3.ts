import { useState, useEffect } from "react";
import { JarV3__factory as JarV3Factory } from "containers/Contracts/factories/JarV3__factory";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import {
  getPriceId,
} from "./jars";
import { BigNumber, ethers } from "ethers";
import { isUniV3, Jar } from "./useFetchJars";
import { getPoolData, getPosition, getProportion, uniV3Info } from "util/univ3";
import { JarWithTVL } from "./useJarsWithTVL";
import { Balances } from "containers/Balances";
import { ERC20Transfer } from "containers/Erc20Transfer";

export interface UniV3Token {
  address: string;
  walletBalance: BigNumber;
  jarAmount: number;
  approved: boolean;
  name: string;
}

export interface JarV3 extends JarWithTVL {
  token0: UniV3Token;
  token1: UniV3Token;
  proportion: BigNumber;
}

export const useJarsWithUniV3 = (
  jars: Array<JarWithTVL> | null,
): { jarsWithV3: Array<JarV3> | null } => {
  const { blockNum, chainName, signer, address } = Connection.useContainer();

  const { erc20 } = Contracts.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();
  const [jarsWithV3, setJarsWithV3] = useState<Array<JarV3> | null>(null);

  const fetchUniV3 = async () => {
    if (jars && signer && erc20 && address) {
      const promises = jars.map(async (jar) => {
        if (!isUniV3(jar.depositToken.address))
          return {
            ...jar,
            token0: null,
            token1: null,
            proportion: null,
          };
        const info = uniV3Info[
          jar.depositToken.address as keyof typeof uniV3Info
        ];

        const [bal0, bal1, proportion] = await Promise.all([
          getBalance(info.token0),
          getBalance(info.token1),
          getProportion(jar.contract.address, signer),
        ]);

        // Check token approvals
        const Token0 = erc20.attach(info.token0).connect(signer);
        const Token1 = erc20.attach(info.token1).connect(signer);
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


        const positionData = await getPosition(info, jarV3Contract, signer)

        return {
          ...jar,
          contract: jarV3Contract,
          token0: {
            address: info.token0,
            walletBalance: bal0,
            jarAmount: positionData.amount0.toExact(),
            approved: allowance0.gt(ethers.constants.Zero),
            name: getPriceId(info.token0),
          },
          token1: {
            address: info.token1,
            walletBalance: bal1,
            jarAmount: positionData.amount1.toExact(),
            approved: allowance1.gt(ethers.constants.Zero),
            name: getPriceId(info.token1),
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
  }, [chainName, jars, blockNum, tokenBalances, transferStatus]);
  return { jarsWithV3 };
};

