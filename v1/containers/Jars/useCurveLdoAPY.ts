import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";

import { Prices } from "../Prices";
import { Jar } from "./useFetchJars";

import { StakingRewards } from "../Contracts/StakingRewards";
import { Pool } from "../Contracts/Pool";

import { Connection } from "../Connection";
import { Contract as MulticallContract } from "ethers-multicall";

export interface JarApy {
  [k: string]: number;
}

export interface JarWithAPY extends Jar {
  totalAPY: number;
  APYs: Array<JarApy>;
}

type Input = Array<Jar> | null;
type Output = {
  APYs: Array<{ [key: string]: number }>;
};

const getCompoundingAPY = (apr: number) => {
  return 100 * (Math.pow(1 + apr / 365, 365) - 1);
};

export const useCurveLdoAPY = (
  jars: Input,
  pool: Pool | null,
  stakingRewards: StakingRewards | null,
): Output => {
  const { multicallProvider, chainName } = Connection.useContainer();
  const { prices } = Prices.useContainer();

  const [ldoAPY, setLdoAPY] = useState<number | null>(null);

  const getLdoAPY = async () => {
    if (stakingRewards && pool && multicallProvider && prices?.ldo) {
      const mcPool = new MulticallContract(pool.address, pool.interface.fragments);

      const mcStakingRewards = new MulticallContract(
        stakingRewards.address,
        stakingRewards.interface.fragments,
      );

      const [, rewardsRate, totalSupply, virtualPrice] = (
        await multicallProvider.all([
          mcStakingRewards.rewardsDuration(),
          mcStakingRewards.rewardRate(),
          mcStakingRewards.totalSupply(),
          mcPool.get_virtual_price(),
        ])
      ).map((x, i) => {
        if (i === 0) {
          return parseFloat(ethers.utils.formatUnits(x, 0));
        }
        return parseFloat(ethers.utils.formatEther(x));
      });
      const reward = rewardsRate * 365 * 3600 * 24;

      // https://github.com/curvefi/curve-dao/blob/2850af67abb42cbd50d940ae6280fc34659e8142/src/components/common/DailyAPYChart.vue
      const ldoAPY = (reward * prices.ldo) / (totalSupply * virtualPrice * prices.eth);
      setLdoAPY(ldoAPY * 0.8);
    }
  };

  useEffect(() => {
    if (chainName === ChainNetwork.Ethereum) getLdoAPY();
  }, [jars, prices]);

  return {
    APYs: [{ ldo: getCompoundingAPY(ldoAPY || 0), apr: (ldoAPY || 0) * 100 }],
  };
};
