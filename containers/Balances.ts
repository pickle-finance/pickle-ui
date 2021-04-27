import { createContainer } from "unstated-next";
import { useEffect, useState } from "react";

import { Connection } from "./Connection";
import { Contracts } from "./Contracts";
import { ethers } from "ethers";

import { Contract as MulticallContract } from "@0xsequence/multicall";

interface TokenBalances {
  [k: string]: ethers.BigNumber;
}

function useBalances() {
  const {
    address,
    provider,
    blockNum,
    multicallProvider,
  } = Connection.useContainer();
  const { erc20 } = Contracts.useContainer();

  const [tokenBalances, setTokenBalances] = useState<TokenBalances>({});
  const [tokenAddresses, setTokenAddresses] = useState<Array<string>>([]);

  const updateBalances = async () => {
    if (erc20 && address && provider && multicallProvider) {
      const balances = await multicallProvider.all(
        tokenAddresses.map((x) => {
          const c = new MulticallContract(x, erc20.interface.fragments);
          return c.balanceOf(address);
        }),
      );

      const res = tokenAddresses.map((x, idx) => {
        return {
          [x]: balances[idx],
        };
      });

      const newTokenBalances = res.reduce((acc, x) => {
        return { ...acc, ...x };
      }, {});

      setTokenBalances(newTokenBalances);
    }
  };

  useEffect(() => {
    updateBalances();
  }, [blockNum, tokenAddresses]);

  const addTokens = async (addresses: Array<string>) => {
    const newAddresses = addresses
      .map((x) => x.toLowerCase())
      .filter((x) => !tokenAddresses.includes(x));
    setTokenAddresses([...tokenAddresses, ...newAddresses]);
  };

  const getBalance = async (address: string) => {
    return tokenBalances[address.toLowerCase()];
  };

  return {
    tokenBalances,
    addTokens,
    getBalance,
  };
}

export const Balances = createContainer(useBalances);
