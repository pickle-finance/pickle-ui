import { useEffect, useState } from "react";

import { DEPOSIT_TOKENS_JAR_NAMES, JAR_DEPOSIT_TOKENS } from "./jars";
import { Prices } from "../Prices";
import { Contracts, COMETH_USDC_WETH_REWARDS } from "../Contracts";
import { Jar } from "./useFetchJars";
import { useComethPairDayData } from "./useComethPairDayData";
import { formatEther } from "ethers/lib/utils";
import { ComethPairs } from "../ComethPairs";

import { Connection } from "../Connection";
import { Contract } from "@ethersproject/contracts";

export interface JarApy {
  [k: string]: number;
}

export interface JarWithAPY extends Jar {
  totalAPY: number;
  apr: number;
  APYs: Array<JarApy>;
}

type Input = Array<Jar> | null;
type Output = {
  jarsWithAPY: Array<JarWithAPY> | null;
};

const getCompoundingAPY = (apr: number) => {
  return 100 * (Math.pow(1 + apr / 365, 365) - 1);
};

export const useJarWithAPY = (jars: Input): Output => {
  const { multicallProvider } = Connection.useContainer();
  const { controller, strategy } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { getPairData: getComethPairData } = ComethPairs.useContainer();
  const { stakingRewards } = Contracts.useContainer();
  const { getComethPairDayAPY } = useComethPairDayData();
  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );

  const calculateComethAPY = async (rewardsAddress: string) => {
    if (
      stakingRewards &&
      prices?.must &&
      getComethPairData &&
      multicallProvider
    ) {
      const multicallStakingRewards = new Contract(
        rewardsAddress,
        stakingRewards.interface.fragments,
        multicallProvider,
      );

      const [
        rewardsDurationBN,
        rewardsForDurationBN,
        stakingToken,
        totalSupplyBN,
      ] = await Promise.all([
        multicallStakingRewards.rewardsDuration(),
        multicallStakingRewards.getRewardForDuration(),
        multicallStakingRewards.stakingToken(),
        multicallStakingRewards.totalSupply(),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const rewardsDuration = rewardsDurationBN.toNumber(); //epoch
      const rewardsForDuration = parseFloat(formatEther(rewardsForDurationBN));

      const { pricePerToken } = await getComethPairData(stakingToken);

      const rewardsPerYear =
        rewardsForDuration * ((360 * 24 * 60 * 60) / rewardsDuration);
      const valueRewardedPerYear = prices.must * rewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const apy = valueRewardedPerYear / totalValueStaked;

      return [{ must: getCompoundingAPY(apy * 0.8), apr: apy * 0.8 * 100 }];
    }

    return [];
  };

  const calculateAPY = async () => {
    if (jars && controller && strategy) {
      const [comethUsdcWethApy] = await Promise.all([
        calculateComethAPY(COMETH_USDC_WETH_REWARDS),
      ]);

      const promises = jars.map(async (jar) => {
        let APYs: Array<JarApy> = [];

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.COMETH_USDC_WETH) {
          APYs = [
            ...comethUsdcWethApy,
            ...getComethPairDayAPY(JAR_DEPOSIT_TOKENS.COMETH_USDC_WETH),
          ];
        }

        let apr = 0;
        APYs.map((x) => {
          if (x.apr) {
            apr += x.apr;
            delete x.apr;
          }
        });

        let lp = 0;
        APYs.map((x) => {
          if (x.lp) {
            lp += x.lp;
          }
        });

        // const totalAPY = APYs.map((x) => {
        //   return Object.values(x).reduce((acc, y) => acc + y, 0);
        // }).reduce((acc, x) => acc + x, 0);
        const totalAPY = getCompoundingAPY(apr / 100) + lp;

        return {
          ...jar,
          APYs,
          totalAPY,
          apr,
        };
      });

      const newJarsWithAPY = await Promise.all(promises);

      setJarsWithAPY(newJarsWithAPY);
    }
  };

  useEffect(() => {
    calculateAPY();
  }, [jars, prices]);

  return { jarsWithAPY };
};
