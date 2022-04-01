import { useMemo } from "react";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

// TODO: use pf-core files when they're included in the distribution
import { Erc20__factory as Erc20Factory } from "containers/Contracts/factories/Erc20__factory";
import { Erc20 } from "containers/Contracts/Erc20";
import { Dill__factory as DillFactory } from "containers/Contracts/factories/Dill__factory";
import { Dill } from "containers/Contracts/Dill";
import { FeeDistributor__factory as FeeDistributorFactory } from "containers/Contracts/factories/FeeDistributor__factory";
import { FeeDistributor } from "containers/Contracts/FeeDistributor";

export const useTokenContract = (address: string) => {
  const { library } = useWeb3React<Web3Provider>();

  const TokenContract = useMemo<Erc20 | undefined>(() => {
    if (!library) return;

    return Erc20Factory.connect(address, library.getSigner());
  }, [library, address]);

  return TokenContract;
};

export const useDillContract = (address: string) => {
  const { library } = useWeb3React<Web3Provider>();

  const DillContract = useMemo<Dill | undefined>(() => {
    if (!library) return;

    return DillFactory.connect(address, library.getSigner());
  }, [library, address]);

  return DillContract;
};

export const useDistributorContract = (address: string) => {
  const { library } = useWeb3React<Web3Provider>();

  const DistributorContract = useMemo<FeeDistributor | undefined>(() => {
    if (!library) return;

    return FeeDistributorFactory.connect(address, library.getSigner());
  }, [library, address]);

  return DistributorContract;
};
