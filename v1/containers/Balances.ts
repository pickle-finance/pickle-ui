import { BigNumber } from "ethers";
import { Contract as MulticallContract } from "ethers-multicall";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import { Connection } from "./Connection";
import { Contracts } from "./Contracts";

interface TokenBalances {
  [k: string]: BigNumber;
}

function useBalances() {
  const { address, blockNum, multicallProvider } = Connection.useContainer();
  const { erc20 } = Contracts.useContainer();

  const [tokenBalances, setTokenBalances] = useState<TokenBalances>({});
  const [tokenAddresses, setTokenAddresses] = useState<string[]>([]);

  const updateBalances = async () => {
    if (erc20 && address && multicallProvider) {
      const balances: BigNumber[] = await multicallProvider.all(
        tokenAddresses.map((x) => {
          const c = new MulticallContract(x, [...erc20.interface.fragments]);
          return c.balanceOf(address);
        }),
      );

      const newTokenBalances: TokenBalances = {};
      tokenAddresses.forEach((address, index) => (newTokenBalances[address] = balances[index]));
      setTokenBalances(newTokenBalances);
    }
  };

  useEffect(() => {
    updateBalances();
  }, [blockNum, tokenAddresses]);

  const addTokens = (addresses: string[]) => {
    const newAddresses = addresses
      .map((x) => x.toLowerCase())
      .filter((x) => !tokenAddresses.includes(x));
    setTokenAddresses([...tokenAddresses, ...newAddresses]);
  };

  const getBalance = (address: string) => tokenBalances[address.toLowerCase()];

  return {
    tokenBalances,
    addTokens,
    getBalance,
  };
}

export const Balances = createContainer(useBalances);
