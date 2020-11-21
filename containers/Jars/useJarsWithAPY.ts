import { useEffect, useState } from "react";

import {
  STRATEGY_NAMES,
  DEPOSIT_TOKENS_JAR_NAMES,
  JAR_DEPOSIT_TOKENS,
} from "./jars";
import { Prices } from "../Prices";
import {
  UNI_ETH_DAI_STAKING_REWARDS,
  UNI_ETH_USDC_STAKING_REWARDS,
  UNI_ETH_USDT_STAKING_REWARDS,
  UNI_ETH_WBTC_STAKING_REWARDS,
  SCRV_STAKING_REWARDS,
  Contracts,
} from "../Contracts";
import { Jar } from "./useFetchJars";
import { useCurveRawStats } from "./useCurveRawStats";
import { useCurveCrvAPY } from "./useCurveCrvAPY";
import { useCurveSNXAPY } from "./useCurveSNXAPY";
import { useUniPairDayData } from "./useUniPairDayData";
import { formatEther } from "ethers/lib/utils";
import { UniV2Pairs } from "../UniV2Pairs";
import { useCompAPY } from "./useCompAPY";

import compound from "@studydefi/money-legos/compound";

import { Contract as MulticallContract } from "ethers-multicall";
import { Connection } from "../Connection";

export interface JarApy {
  [k: string]: number;
}

export interface JarWithAPY extends Jar {
  totalAPY: number;
  APYs: Array<JarApy>;
}

type Input = Array<Jar> | null;
type Output = {
  jarsWithAPY: Array<JarWithAPY> | null;
};

export const useJarWithAPY = (jars: Input): Output => {
  const { multicallProvider } = Connection.useContainer();
  const { controller, strategy } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { getPairData } = UniV2Pairs.useContainer();
  const {
    stakingRewards,
    susdPool,
    susdGauge,
    renGauge,
    renPool,
    threeGauge,
    threePool,
  } = Contracts.useContainer();
  const { getUniPairDayAPY } = useUniPairDayData();
  const { rawStats: curveRawStats } = useCurveRawStats();
  const { APYs: susdCrvAPY } = useCurveCrvAPY(
    jars,
    prices?.usdc || null,
    susdGauge,
    susdPool,
  );
  const { APYs: threePoolCrvAPY } = useCurveCrvAPY(
    jars,
    prices?.usdc || null,
    threeGauge,
    threePool,
  );
  const { APYs: ren2CrvAPY } = useCurveCrvAPY(
    jars,
    prices?.wbtc || null,
    renGauge,
    renPool,
  );
  const { APYs: susdSNXAPY } = useCurveSNXAPY(
    jars,
    susdPool,
    stakingRewards ? stakingRewards.attach(SCRV_STAKING_REWARDS) : null,
  );
  const { APYs: compDaiAPYs } = useCompAPY(compound.cDAI.address);

  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );

  const calculateUNIAPY = async (rewardsAddress: string) => {
    if (stakingRewards && prices?.uni && getPairData && multicallProvider) {
      const multicallUniStakingRewards = new MulticallContract(
        rewardsAddress,
        stakingRewards.interface.fragments,
      );

      const [
        rewardsDurationBN,
        uniRewardsForDurationBN,
        stakingToken,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallUniStakingRewards.rewardsDuration(),
        multicallUniStakingRewards.getRewardForDuration(),
        multicallUniStakingRewards.stakingToken(),
        multicallUniStakingRewards.totalSupply(),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const rewardsDuration = rewardsDurationBN.toNumber(); //epoch
      const uniRewardsForDuration = parseFloat(
        formatEther(uniRewardsForDurationBN),
      );

      const { pricePerToken } = await getPairData(stakingToken);

      const uniRewardsPerYear =
        uniRewardsForDuration * ((360 * 24 * 60 * 60) / rewardsDuration);
      const valueRewardedPerYear = prices.uni * uniRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const uniAPY = valueRewardedPerYear / totalValueStaked;

      // no more UNI being distributed
      return [{ uni: 0 * 100 * 0.725 }];
    }

    return [];
  };

  const calculateAPY = async () => {
    if (jars && controller && strategy) {
      const [
        uniEthDaiApy,
        uniEthUsdcApy,
        uniEthUsdtApy,
        uniEthWBtcApy,
      ] = await Promise.all([
        calculateUNIAPY(UNI_ETH_DAI_STAKING_REWARDS),
        calculateUNIAPY(UNI_ETH_USDC_STAKING_REWARDS),
        calculateUNIAPY(UNI_ETH_USDT_STAKING_REWARDS),
        calculateUNIAPY(UNI_ETH_WBTC_STAKING_REWARDS),
      ]);

      const promises = jars.map(async (jar) => {
        let APYs: Array<JarApy> = [];

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.sCRV) {
          APYs = [
            { lp: curveRawStats?.ren2 || 0 },
            ...susdCrvAPY,
            ...susdSNXAPY,
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.renCRV) {
          APYs = [{ lp: curveRawStats?.susd || 0 }, ...ren2CrvAPY];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES["3CRV"]) {
          APYs = [
            { lp: curveRawStats ? curveRawStats["3pool"] : 0 },
            ...threePoolCrvAPY,
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_ETH_DAI) {
          APYs = [
            ...uniEthDaiApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_ETH_DAI),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_ETH_USDC) {
          APYs = [
            ...uniEthUsdcApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_ETH_USDC),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_ETH_USDT) {
          APYs = [
            ...uniEthUsdtApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_ETH_USDT),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_ETH_WBTC) {
          APYs = [
            ...uniEthWBtcApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_ETH_WBTC),
          ];
        }

        // if (jar.strategyName === STRATEGY_NAMES.DAI.COMPOUNDv2) {
        //   const leverageBN = await jar.strategy.callStatic.getCurrentLeverage();
        //   const leverage = parseFloat(formatEther(leverageBN));

        //   const compDaiAPYsWithLeverage = compDaiAPYs.map((x) => {
        //     const key = Object.keys(x)[0];
        //     return {
        //       [key]: x[key] * leverage,
        //     };
        //   });

        //   APYs = [...compDaiAPYsWithLeverage];
        // }

        const totalAPY = APYs.map((x) => {
          return Object.values(x).reduce((acc, y) => acc + y, 0);
        }).reduce((acc, x) => acc + x, 0);

        return {
          ...jar,
          APYs,
          totalAPY,
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
