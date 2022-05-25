import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";

import { Prices } from "../Prices";
import { Jar } from "./useFetchJars";

import { StakingRewards } from "../Contracts/StakingRewards";
import { Pool } from "../Contracts/Pool";

import { Connection } from "../Connection";
import { Contract as MulticallContract } from "ethers-multicall";
import { ChainNetwork } from "picklefinance-core";

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

export const useCurveSNXAPY = (
  jars: Input,
  pool: Pool | null,
  stakingRewards: StakingRewards | null,
): Output => {
  const { multicallProvider, chainName } = Connection.useContainer();
  const { prices } = Prices.useContainer();

  const [SNXAPY, setSNXAPY] = useState<number | null>(null);

  const getSNXAPY = async () => {
    if (stakingRewards && pool && multicallProvider && prices?.snx) {
      const mcPool = new MulticallContract(pool.address, pool.interface.fragments);

      const mcStakingRewards = new MulticallContract(
        stakingRewards.address,
        stakingRewards.interface.fragments,
      );

      const [rewardsDuration, rewardsRate, totalSupply, virtualPrice] = (
        await multicallProvider.all([
          mcStakingRewards.DURATION(),
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

      const reward = rewardsDuration * rewardsRate;

      // https://github.com/curvefi/curve-dao/blob/2850af67abb42cbd50d940ae6280fc34659e8142/src/components/common/DailyAPYChart.vue
      const snxAPY =
        (0.725 * 100 * (((365 * reward) / 7) * prices.snx)) / (0.98 * totalSupply * virtualPrice);

      setSNXAPY(snxAPY * 0.725);
    }
  };

  useEffect(() => {
    if (chainName === ChainNetwork.Ethereum) getSNXAPY();
  }, [jars, prices]);

  return {
    APYs: [{ snx: getCompoundingAPY((SNXAPY || 0) / 100), apr: SNXAPY || 0 }],
  };
};
