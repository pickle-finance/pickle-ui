import { useState, useEffect, useMemo } from "react";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { PickleModelJson } from "picklefinance-core";

// TODO: use pf-core files when they're included in the distribution
import { Dill__factory as DillFactory } from "v1/containers/Contracts/factories/Dill__factory";
import { Dill } from "v1/containers/Contracts/Dill";
import { FeeDistributorV2__factory as FeeDistributorFactoryV2 } from "v1/containers/Contracts/factories/FeeDistributorV2__factory";
import { FeeDistributor__factory as FeeDistributorFactory } from "v1/containers/Contracts/factories/FeeDistributor__factory";
import { FeeDistributorV2 } from "v1/containers/Contracts/FeeDistributorV2";
import { FeeDistributor } from "v1/containers/Contracts/FeeDistributor";

export const useDillContract = (address: string) => {
  const { library } = useWeb3React<Web3Provider>();

  const DillContract = useMemo<Dill | undefined>(() => {
    if (!library) return;

    return DillFactory.connect(address, library.getSigner());
  }, [library, address]);

  return DillContract;
};

export const useDistributorV2Contract = (address: string) => {
  const { library } = useWeb3React<Web3Provider>();

  const DistributorContract = useMemo<FeeDistributorV2 | undefined>(() => {
    if (!library) return;

    return FeeDistributorFactoryV2.connect(address, library.getSigner());
  }, [library, address]);

  return DistributorContract;
};

export const useDistributorContract = (address: string) => {
  const { library } = useWeb3React<Web3Provider>();

  const DistributorContract = useMemo<FeeDistributor | undefined>(() => {
    if (!library) return;

    return FeeDistributorFactory.connect(address, library.getSigner());
  }, [library, address]);

  return DistributorContract;
};

// This function doesn't work correctly and is not used in UIv2. DO NOT USE IN UIv2
export function useProtocolIncome(pickleCore: PickleModelJson.PickleModelJson) {
  const [weeklyProfit, setWeeklyProfit] = useState<number | null>(null);
  const [weeklyDistribution, setWeeklyDistribution] = useState<number | null>(null);

  const getWeeklyIncome = async () => {
    if (pickleCore) {
      const jars = pickleCore.assets.jars;
      const profit = jars.reduce((acc, currJar: JarDefinition) => {
        const jarTVL = currJar.details?.harvestStats?.balanceUSD || 0;
        let apr = currJar.aprStats?.components
          .filter((x) => x.compoundable)
          .reduce((acc, curr) => {
            return acc + curr.apr;
          }, 0);
        if (apr === undefined) apr = 0;
        const chain = pickleCore.chains.find((x) => x.network === currJar.chain);
        const perfFee = chain ? chain.defaultPerformanceFee : 0.2;
        const subtotal = (jarTVL * apr * 0.01 * perfFee) / 52;
        return acc + subtotal;
      }, 0);

      const weeklyDistribution = profit * 0.45;

      setWeeklyProfit(profit);
      setWeeklyDistribution(weeklyDistribution);
    }
  };

  useEffect(() => {
    getWeeklyIncome();
  }, [pickleCore]);

  return {
    weeklyProfit,
    weeklyDistribution,
  };
}
