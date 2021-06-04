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
  LQTY_LUSD_ETH_STAKING_REWARDS,
  MIRROR_MIR_UST_STAKING_REWARDS,
  MIRROR_MTSLA_UST_STAKING_REWARDS,
  MIRROR_MAAPL_UST_STAKING_REWARDS,
  MIRROR_MQQQ_UST_STAKING_REWARDS,
  MIRROR_MSLV_UST_STAKING_REWARDS,
  MIRROR_MBABA_UST_STAKING_REWARDS,
  FEI_TRIBE_STAKING_REWARDS,
  ALCHEMIX_ALCX_ETH_STAKING_POOLS,
} from "../Contracts";
import { getProtocolData } from "../../util/api";
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

import AlcxRewarderABI from "../ABIs/alcxrewarder.json";

const AVERAGE_BLOCK_TIME = 13.22;
const YEARN_API = "https://vaults.finance/all";

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
  "0x795065dCc9f64b5614C407a6EFDC400DA6221FB0": 12,
  "0x9461173740D27311b176476FA27e94C681b1Ea6b": 230,
};

const sushiPoolV2Ids: SushiPoolId = {
  "0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8": 0,
};

const fetchRes = async (url: string) => await fetch(url).then((x) => x.json());

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
    stakingPools,
    masterchefV2,
    yearnRegistry,
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
  const [tvlData, setTVLData] = useState<Array<Object>>([]);

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

  const calculateLqtyAPY = async (rewardsAddress: string) => {
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
        multicallUniStakingRewards.uniToken(),
        multicallUniStakingRewards.totalSupply(),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const lqtyRewardRate = parseFloat(formatEther(rewardRateBN));

      const { pricePerToken } = await getUniPairData(stakingToken);

      const mirRewardsPerYear = lqtyRewardRate * (360 * 24 * 60 * 60);
      const valueRewardedPerYear = prices.lqty * mirRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const lqtyAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { lqty: getCompoundingAPY(lqtyAPY * 0.8), apr: lqtyAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateFeiAPY = async (rewardsAddress: string) => {
    if (
      stakingRewards &&
      prices?.tribe &&
      getUniPairData &&
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
        multicallUniStakingRewards.stakingToken(),
        multicallUniStakingRewards.totalSupply(),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const tribeRewardRate = parseFloat(formatEther(rewardRateBN));

      const { pricePerToken } = await getUniPairData(stakingToken);

      const tribeRewardsPerYear = tribeRewardRate * (360 * 24 * 60 * 60);
      const valueRewardedPerYear = prices.tribe * tribeRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const tribeAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { tribe: getCompoundingAPY(tribeAPY * 0.8), apr: tribeAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateAlcxAPY = async (lpTokenAddress: string) => {
    if (masterchefV2 && prices?.alcx && getSushiPairData && multicallProvider) {
      const poolId = sushiPoolV2Ids[lpTokenAddress];

      const alcx_rewarder_addr = await masterchefV2.rewarder(poolId);

      const multicallAlcxRewarder = new MulticallContract(
        alcx_rewarder_addr,
        AlcxRewarderABI,
      );
      const lpToken = new MulticallContract(lpTokenAddress, erc20.abi);

      const [tokenPerBlockBN, totalSupplyBN] = await multicallProvider.all([
        multicallAlcxRewarder.tokenPerBlock(),
        lpToken.balanceOf(masterchefV2.address),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));

      const { pricePerToken } = await getSushiPairData(lpTokenAddress);

      const alcxRewardsPerYear =
        (parseFloat(formatEther(tokenPerBlockBN)) * (360 * 24 * 60 * 60)) /
        AVERAGE_BLOCK_TIME;

      const valueRewardedPerYear = prices.alcx * alcxRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const alcxAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { alcx: getCompoundingAPY(alcxAPY * 0.8), apr: alcxAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const getLunaAPY = (tokenAddress: string) => {
    const TOTAL_REWARD = 1084.43;
    let reward, apy;
    switch (tokenAddress) {
      case JAR_DEPOSIT_TOKENS.UNIV2_MIR_UST:
        reward = TOTAL_REWARD * 25;
        apy =
          tvlData && tvlData["mir-ust"]
            ? (((prices?.luna ?? 0) * reward) / tvlData["mir-ust"]) * 26
            : 0;
        break;
      case JAR_DEPOSIT_TOKENS.UNIV2_MTSLA_UST:
        reward = TOTAL_REWARD * 15;
        apy = tvlData["mtsla-ust"]
          ? (((prices?.luna ?? 0) * reward) / (tvlData["mtsla-ust"] * 2)) * 26
          : 0;
        break;
      case JAR_DEPOSIT_TOKENS.UNIV2_MAAPL_UST:
        reward = TOTAL_REWARD * 15;
        apy = tvlData["maapl-ust"]
          ? (((prices?.luna ?? 0) * reward) / (tvlData["maapl-ust"] * 2)) * 26
          : 0;
        break;
      case JAR_DEPOSIT_TOKENS.UNIV2_MQQQ_UST:
        reward = TOTAL_REWARD * 15;
        apy = tvlData["mqqq-ust"]
          ? (((prices?.luna ?? 0) * reward) / (tvlData["mqqq-ust"] * 2)) * 26
          : 0;
        break;
      case JAR_DEPOSIT_TOKENS.UNIV2_MSLV_UST:
        reward = TOTAL_REWARD * 15;
        apy = tvlData["mslv-ust"]
          ? (((prices?.luna ?? 0) * reward) / (tvlData["mslv-ust"] * 2)) * 26
          : 0;
        break;
      case JAR_DEPOSIT_TOKENS.UNIV2_MBABA_UST:
        reward = TOTAL_REWARD * 15;
        apy = tvlData["mbaba-ust"]
          ? (((prices?.luna ?? 0) * reward) / (tvlData["mbaba-ust"] * 2)) * 26
          : 0;
        break;
      default:
        return [];
    }

    return [{ luna: apy }];
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
      return [
        { sushi: getCompoundingAPY(sushiAPY * 0.8), apr: sushiAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateSushiV2APY = async (lpTokenAddress: string) => {
    if (
      masterchefV2 &&
      prices?.sushi &&
      getSushiPairData &&
      multicallProvider
    ) {
      const poolId = sushiPoolV2Ids[lpTokenAddress];
      const multicallMasterChefV2 = new MulticallContract(
        masterchefV2.address,
        masterchefV2.interface.fragments,
      );
      const lpToken = new MulticallContract(lpTokenAddress, erc20.abi);

      const [
        sushiPerBlockBN,
        totalAllocPointBN,
        poolInfo,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallMasterChefV2.sushiPerBlock(),
        multicallMasterChefV2.totalAllocPoint(),
        multicallMasterChefV2.poolInfo(poolId),
        lpToken.balanceOf(masterchefV2.address),
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
      return [
        { sushi: getCompoundingAPY(sushiAPY * 0.8), apr: sushiAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateYearnAPY = async (depositToken: string) => {
    if (yearnRegistry) {
      const vault = await yearnRegistry.latestVault(depositToken, {
        gasLimit: 1000000,
      });
      const yearnData = await fetchRes(YEARN_API);
      const vaultData = yearnData.find(
        (x) => x.address.toLowerCase() === vault.toLowerCase(),
      );
      if (vaultData) {
        const apr = vaultData.apy.data.oneWeekSample
          ? vaultData.apy.data.oneWeekSample
          : vaultData.apy.data.netApy;
        return [
          {
            yearn: apr * 100,
            apr: apr * 100,
          },
          { vault: vaultData.name },
        ];
      }
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
        sushiEthApy,
        sushiEthAlcxApy,
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
        calculateSushiAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH),
        calculateSushiV2APY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_ALCX),
      ]);

      const [
        mithMicUsdtApy,
        mithMisUsdtApy,
        sushiEthyveCRVApy,
        sushiEthyvboostApy,
        // basisBacDaiApy,
        // basisBasDaiApy,
        alcxEthAlcxApy,
        usdcApy,
        crvLusdApy,
      ] = await Promise.all([
        calculateMithAPY(MITH_MIC_USDT_STAKING_REWARDS),
        calculateMithAPY(MITH_MIS_USDT_STAKING_REWARDS),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_YVECRV),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_YVBOOST),
        // calculateBasisV2APY(BASIS_BAC_DAI_STAKING_REWARDS, BASIS_BAC_DAI_PID),
        // calculateBasisV2APY(BASIS_BAS_DAI_STAKING_REWARDS, BASIS_BAS_DAI_PID),
        calculateAlcxAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_ALCX),
        calculateYearnAPY(JAR_DEPOSIT_TOKENS.USDC),
        calculateYearnAPY(JAR_DEPOSIT_TOKENS.lusdCRV),
      ]);

      const [
        mirrorMirUstApy,
        mirrorMtslaUstApy,
        mirrorMaaplUstApy,
        mirrorMqqqUstApy,
        mirrorMslvUstApy,
        mirrorMbabaUstApy,
        feiTribeApy,
        lqtyEthLusdApy,
      ] = await Promise.all([
        calculateMirAPY(MIRROR_MIR_UST_STAKING_REWARDS),
        calculateMirAPY(MIRROR_MTSLA_UST_STAKING_REWARDS),
        calculateMirAPY(MIRROR_MAAPL_UST_STAKING_REWARDS),
        calculateMirAPY(MIRROR_MQQQ_UST_STAKING_REWARDS),
        calculateMirAPY(MIRROR_MSLV_UST_STAKING_REWARDS),
        calculateMirAPY(MIRROR_MBABA_UST_STAKING_REWARDS),
        calculateFeiAPY(FEI_TRIBE_STAKING_REWARDS),
        calculateLqtyAPY(LQTY_LUSD_ETH_STAKING_REWARDS),
      ]);

      const promises = jars.map(async (jar) => {
        let APYs: Array<JarApy> = [];
        let totalAPY = 0;

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

        // if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_BAC_DAI) {
        //   APYs = [
        //     ...basisBacDaiApy,
        //     ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_BAC_DAI),
        //   ];
        // }

        // if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_BAS_DAI) {
        //   APYs = [
        //     ...basisBasDaiApy,
        //     ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_BAS_DAI),
        //   ];
        // }
        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MIR_UST) {
          APYs = [
            ...mirrorMirUstApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_MIR_UST),
            ...getLunaAPY(JAR_DEPOSIT_TOKENS.UNIV2_MIR_UST),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MTSLA_UST) {
          APYs = [
            ...mirrorMtslaUstApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_MTSLA_UST),
            ...getLunaAPY(JAR_DEPOSIT_TOKENS.UNIV2_MTSLA_UST),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MAAPL_UST) {
          APYs = [
            ...mirrorMaaplUstApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_MAAPL_UST),
            ...getLunaAPY(JAR_DEPOSIT_TOKENS.UNIV2_MAAPL_UST),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MQQQ_UST) {
          APYs = [
            ...mirrorMqqqUstApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_MQQQ_UST),
            ...getLunaAPY(JAR_DEPOSIT_TOKENS.UNIV2_MQQQ_UST),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MSLV_UST) {
          APYs = [
            ...mirrorMslvUstApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_MSLV_UST),
            ...getLunaAPY(JAR_DEPOSIT_TOKENS.UNIV2_MSLV_UST),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MBABA_UST) {
          APYs = [
            ...mirrorMbabaUstApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_MBABA_UST),
            ...getLunaAPY(JAR_DEPOSIT_TOKENS.UNIV2_MBABA_UST),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_FEI_TRIBE) {
          APYs = [
            ...feiTribeApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_FEI_TRIBE),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_LUSD_ETH) {
          APYs = [
            ...lqtyEthLusdApy,
            ...getUniPairDayAPY(JAR_DEPOSIT_TOKENS.UNIV2_LUSD_ETH),
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

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_YVBOOST) {
          APYs = [
            ...sushiEthyvboostApy,
            ...getSushiPairDayAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_YVBOOST),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH) {
          APYs = [
            ...sushiEthApy,
            ...getSushiPairDayAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_ALCX) {
          APYs = [
            ...alcxEthAlcxApy,
            ...sushiEthAlcxApy,
            ...getSushiPairDayAPY(JAR_DEPOSIT_TOKENS.SUSHI_ETH_ALCX),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.USDC) {
          APYs = [...usdcApy];
          totalAPY = usdcApy[0].apr;
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.lusdCRV) {
          APYs = [...crvLusdApy];
          totalAPY = crvLusdApy[0].apr;
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
        if (!totalAPY) totalAPY = getCompoundingAPY(apr / 100) + lp;

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
    getProtocolData().then((tvlData) => setTVLData(tvlData));
    calculateAPY();
  }, [jars, prices]);

  return { jarsWithAPY };
};
