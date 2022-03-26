import { useMemo } from "react";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

// TODO: use pf-core files when they're included in the distribution
import { Erc20__factory as Erc20Factory } from "containers/Contracts/factories/Erc20__factory";
import { Erc20 } from "containers/Contracts/Erc20";
import { Jar__factory as JarFactory } from "containers/Contracts/factories/Jar__factory";
import { Jar } from "containers/Contracts/Jar";

export const useTokenContract = (address: string) => {
  const { library } = useWeb3React<Web3Provider>();

  const TokenContract = useMemo<Erc20 | undefined>(() => {
    if (!library) return;

    return Erc20Factory.connect(address, library.getSigner());
  }, [library, address]);

  return TokenContract;
};

export const useJarContract = (address: string) => {
  const { library } = useWeb3React<Web3Provider>();

  const JarContract = useMemo<Jar | undefined>(() => {
    if (!library) return;

    return JarFactory.connect(address, library.getSigner());
  }, [library, address]);

  return JarContract;
};
