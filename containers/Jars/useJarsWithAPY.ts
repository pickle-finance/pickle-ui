import { useEffect, useState } from "react";

import { DEPOSIT_TOKENS_JAR_NAMES, JAR_DEPOSIT_TOKENS } from "./jars";
import { Prices } from "../Prices";
import {
  UNI_ETH_DAI_STAKING_REWARDS,
  UNI_ETH_USDC_STAKING_REWARDS,
  UNI_ETH_USDT_STAKING_REWARDS,
  UNI_ETH_WBTC_STAKING_REWARDS,
  SCRV_STAKING_REWARDS,
  Contracts,
  BASIS_BAC_DAI_STAKING_REWARDS,
  MITH_MIC_USDT_STAKING_REWARDS,
  STECRV_STAKING_REWARDS,
  MITH_MIS_USDT_STAKING_REWARDS,
  BASIS_BAS_DAI_PID,
  BASIS_BAS_DAI_STAKING_REWARDS,
  BASIS_BAC_DAI_PID,
  BASIS_BAC_DAI_V1_STAKING_REWARDS,
  MIRROR_MIR_UST_STAKING_REWARDS,
} from "../Contracts";
import { Jar } from "./useFetchJars";
import { useCurveRawStats } from "./useCurveRawStats";
import { useCurveCrvAPY } from "./useCurveCrvAPY";
import { useCurveSNXAPY } from "./useCurveSNXAPY";
import { useUniPairDayData } from "./useUniPairDayData";
import { useSushiPairDayData } from "./useSushiPairDayData";
import { formatEther } from "ethers/lib/utils";
import { UniV2Pairs } from "../UniV2Pairs";
import { useCompAPY } from "./useCompAPY";
import erc20 from "@studydefi/money-legos/erc20";

import compound from "@studydefi/money-legos/compound";

import { Contract as MulticallContract } from "ethers-multicall";
import { Connection } from "../Connection";
import { SushiPairs } from "../SushiPairs";
import { useCurveLdoAPY } from "./useCurveLdoAPY";

const AVERAGE_BLOCK_TIME = 13.22;

interface SushiPoolId {
  [key: string]: number;
}

const sushiPoolIds: SushiPoolId = {
  "0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f": 2,
  "0x397FF1542f962076d0BFE58eA045FfA2d347ACa0": 1,
  "0x06da0fd433C1A5d7a4faa01111c044910A184553": 0,
  "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58": 21,
  "0x088ee5007C98a9677165D78dD2109AE4a3D04d0C": 11,
  "0x10B47177E92Ef9D5C6059055d92DdF6290848991": 132,
};

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
  const { getPairData: getSushiPairData } = SushiPairs.useContainer();
  const { getPairData: getUniPairData } = UniV2Pairs.useContainer();
  const {
    stakingRewards,
    susdPool,
    susdGauge,
    renGauge,
    renPool,
    threeGauge,
    threePool,
    sushiChef,
    steCRVPool,
    steCRVGauge,
    basisStaking,
  } = Contracts.useContainer();
  const { getUniPairDayAPY } = useUniPairDayData();
  const { getSushiPairDayAPY } = useSushiPairDayData();
  const { rawStats: curveRawStats } = useCurveRawStats();
  const { APYs: susdCrvAPY } = useCurveCrvAPY(
    jars,
    prices?.usdc || null,
    susdGauge,
    susdPool,
  );
  const { APYs: stEthCrvAPY } = useCurveCrvAPY(
    jars,
    prices?.eth || null,
    steCRVGauge,
    steCRVPool,
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
  const { APYs: stEthLdoAPY } = useCurveLdoAPY(
    jars,
    steCRVPool,
    stakingRewards ? stakingRewards.attach(STECRV_STAKING_REWARDS) : null,
  );

  const { APYs: compDaiAPYs } = useCompAPY(compound.cDAI.address);

  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );

  const calculateUNIAPY = async (rewardsAddress: string) => {
    if (stakingRewards && prices?.uni && getUniPairData && multicallProvider) {
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

      const { pricePerToken } = await getUniPairData(stakingToken);

      const uniRewardsPerYear =
        uniRewardsForDuration * ((360 * 24 * 60 * 60) / rewardsDuration);
      const valueRewardedPerYear = prices.uni * uniRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const uniAPY = valueRewardedPerYear / totalValueStaked;

      // no more UNI being distributed
      return [{ uni: 0 * 100 * 0.725, apr: 0 }];
    }

    return [];
  };

  const calculateBasisAPY = async (rewardsAddress: string) => {
    if (stakingRewards && prices?.bas && getUniPairData && multicallProvider) {
      const multicallUniStakingRewards = new MulticallContract(
        rewardsAddress,
        stakingRewards.interface.fragments,
      );

      const [
        rewardRateBN,
        stakingToken,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallUniStakingRewards.rewardRate(),
        multicallUniStakingRewards.lpt(),
        multicallUniStakingRewards.totalSupply(),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const basRewardRate = parseFloat(formatEther(rewardRateBN));

      const { pricePerToken } = await getUniPairData(stakingToken);

      const basRewardsPerYear = basRewardRate * (360 * 24 * 60 * 60);
      const valueRewardedPerYear = prices.bas * basRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const basAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { bas: getCompoundingAPY(basAPY * 0.8), apr: basAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateBasisV2APY = async (rewardsAddress: string, pid: number) => {
    if (basisStaking && prices?.bas && getUniPairData && multicallProvider) {
      const multicallBasisStaking = new MulticallContract(
        rewardsAddress,
        basisStaking.interface.fragments,
      );

      const [
        rewardRateBN,
        stakingToken,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallBasisStaking.rewardRatePerPool(pid),
        multicallBasisStaking.tokenOf(pid),
        multicallBasisStaking.totalSupply(pid),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const basRewardRate = parseFloat(formatEther(rewardRateBN));

      const { pricePerToken } = await getUniPairData(stakingToken);

      const basRewardsPerYear = basRewardRate * (360 * 24 * 60 * 60);
      const valueRewardedPerYear = prices.bas * basRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const basAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { bas: getCompoundingAPY(basAPY * 0.8), apr: basAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateMithAPY = async (rewardsAddress: string) => {
    if (
      stakingRewards &&
      prices?.mis &&
      getSushiPairData &&
      multicallProvider
    ) {
      const multicallUniStakingRewards = new MulticallContract(
        rewardsAddress,
        stakingRewards.interface.fragments,
      );

      const [
        rewardRateBN,
        stakingToken,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallUniStakingRewards.rewardRate(),
        multicallUniStakingRewards.lpt(),
        multicallUniStakingRewards.totalSupply(),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const misRewardRate = parseFloat(formatEther(rewardRateBN));

      const { pricePerToken } = await getSushiPairData(stakingToken);

      const misRewardsPerYear = misRewardRate * (360 * 24 * 60 * 60);
      const valueRewardedPerYear = prices.mis * misRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const misAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { mis: getCompoundingAPY(misAPY * 0.8), apr: misAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateMirAPY = async (rewardsAddress: string) => {
    if (stakingRewards && prices?.mir && getUniPairData && multicallProvider) {
      const multicallUniStakingRewards = new MulticallContract(
        rewardsAddress,
        stakingRewards.interface.fragments,
      );

      const [
        rewardRateBN,
        stakingToken,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallUniStakingRewards.rewardRate(),
        multicallUniStakingRewards.lpt(),
        multicallUniStakingRewards.totalSupply(),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const mirRewardRate = parseFloat(formatEther(rewardRateBN));

      const { pricePerToken } = await getUniPairData(stakingToken);

      const mirRewardsPerYear = mirRewardRate * (360 * 24 * 60 * 60);
      const valueRewardedPerYear = prices.mir * mirRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const mirAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { mir: getCompoundingAPY(mirAPY * 0.8), apr: mirAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateSushiAPY = async (lpTokenAddress: string) => {
    if (sushiChef && prices?.sushi && getSushiPairData && multicallProvider) {
      const poolId = sushiPoolIds[lpTokenAddress];
      const multicallSushiChef = new MulticallContract(
        sushiChef.address,
        sushiChef.interface.fragments,
      );
      const lpToken = new MulticallContract(lpTokenAddress, erc20.abi);

      const [
        sushiPerBlockBN,
        totalAllocPointBN,
        poolInfo,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallSushiChef.sushiPerBlock(),
        multicallSushiChef.totalAllocPoint(),
        multicallSushiChef.poolInfo(poolId),
        lpToken.balanceOf(sushiChef.address),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const sushiRewardsPerBlock =
        (parseFloat(formatEther(sushiPerBlockBN)) *
          0.9 *
          poolInfo.allocPoint.toNumber()) /
        totalAllocPointBN.toNumber();

      const { pricePerToken } = await getSushiPairData(lpTokenAddress);

      const sushiRewardsPerYear =
        sushiRewardsPerBlock * ((360 * 24 * 60 * 60) / AVERAGE_BLOCK_TIME);
      const valueRewardedPerYear = prices.sushi * sushiRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const sushiAPY = valueRewardedPerYear / totalValueStaked;

      // no more UNI being distributed
      return [{ sushi: getCompoundingAPY(sushiAPY), apr: sushiAPY * 100 }];
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
        sushiEthDaiApy,
        sushiEthUsdcApy,
        sushiEthUsdtApy,
        sushiEthWBtcApy,
        sushiEthYfiApy,
      ] = await Promise.all([
        calculateUNIAPY(UNI_ETH_DAI_STAKING_REWARDS),
        calculateUNIAPY(UNI_ETH_USDC_STAKING_REWARDS),
        calculateUNIAPY(UNI_ETH_USDT_STAKING_REWARDS),
        calculateUNIAPY(UNI_ETH_WBTC_STAKING_REWARDS),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_DAI),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_USDC),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_USDT),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_WBTC),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_YFI),
      ]);

      const [
        mithMicUsdtApy,
        mithMisUsdtApy,
        sushiEthyveCRVApy,
        // basisBacDaiApy,
        // basisBasDaiApy,
        mirrorMirUstApy,
      ] = await Promise.all([
        calculateMithAPY(MITH_MIC_USDT_STAKING_REWARDS),
        calculateMithAPY(MITH_MIS_USDT_STAKING_REWARDS),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_YVECRV),
        // calculateBasisV2APY(BASIS_BAC_DAI_STAKING_REWARDS, BASIS_BAC_DAI_PID),
        // calculateBasisV2APY(BASIS_BAS_DAI_STAKING_REWARDS, BASIS_BAS_DAI_PID),
        calculateMirAPY(MIRROR_MIR_UST_STAKING_REWARDS),
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

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.steCRV) {
          APYs = [
            { lp: curveRawStats?.steth || 0 },
            ...stEthLdoAPY,
            ...stEthCrvAPY,
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

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_BAC_DAI) {
          APYs = [
            // ...basisBacDaiApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_BAC_DAI),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_BAS_DAI) {
          APYs = [
            // ...basisBasDaiApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_BAS_DAI),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MIR_UST) {
          APYs = [
            ...mirrorMirUstApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_MIR_UST),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_MIC_USDT) {
          APYs = [
            ...mithMicUsdtApy,
            ...getSushiPairDayAPY(JAR_DEPOSIT_TOKENS.SUSHI_MIC_USDT),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_MIS_USDT) {
          APYs = [
            ...mithMisUsdtApy,
            ...getSushiPairDayAPY(JAR_DEPOSIT_TOKENS.SUSHI_MIS_USDT),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_DAI) {
          APYs = [
            ...sushiEthDaiApy,
            ...getSushiPairDayAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_DAI),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_USDC) {
          APYs = [
            ...sushiEthUsdcApy,
            ...getSushiPairDayAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_USDC),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_USDT) {
          APYs = [
            ...sushiEthUsdtApy,
            ...getSushiPairDayAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_USDT),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_WBTC) {
          APYs = [
            ...sushiEthWBtcApy,
            ...getSushiPairDayAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_WBTC),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_YFI) {
          APYs = [
            ...sushiEthYfiApy,
            ...getSushiPairDayAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_YFI),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_YVECRV) {
          APYs = [
            ...sushiEthyveCRVApy,
            ...getSushiPairDayAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_YVECRV),
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
