import { useEffect, useState } from "react";

import {
  DEPOSIT_TOKENS_JAR_NAMES,
  JAR_DEPOSIT_TOKENS,
  getPriceId,
} from "./jars";
import { ChainName, NETWORK_NAMES } from "containers/config";
import { PriceIds, Prices } from "../Prices";
import {
  UNI_ETH_DAI_STAKING_REWARDS,
  UNI_ETH_USDC_STAKING_REWARDS,
  UNI_ETH_USDT_STAKING_REWARDS,
  UNI_ETH_WBTC_STAKING_REWARDS,
  SCRV_STAKING_REWARDS,
  Contracts,
  STECRV_STAKING_REWARDS,
  LQTY_LUSD_ETH_STAKING_REWARDS,
  MIRROR_MIR_UST_STAKING_REWARDS,
  MIRROR_MTSLA_UST_STAKING_REWARDS,
  MIRROR_MAAPL_UST_STAKING_REWARDS,
  MIRROR_MQQQ_UST_STAKING_REWARDS,
  MIRROR_MSLV_UST_STAKING_REWARDS,
  MIRROR_MBABA_UST_STAKING_REWARDS,
  FEI_TRIBE_STAKING_REWARDS,
  ALCHEMIX_ALCX_ETH_STAKING_POOLS,
  COMETH_USDC_WETH_REWARDS,
  COMMUNAL_FARM,
  FOX_ETH_STAKING_REWARDS,
} from "../Contracts";
import { Jar } from "./useFetchJars";
import SwapFlashLoanABI from "../ABIs/swapflashloan.json";
import CrvRewardsABI from "../ABIs/crv-rewards.json"
import { CrvRewards__factory as CrvRewardsFactory} from "../Contracts/factories/CrvRewards__factory";
import { Erc20__factory as Erc20Factory } from "../Contracts/factories/Erc20__factory";
import { useCurveRawStats } from "./useCurveRawStats";
import { useCurveCrvAPY } from "./useCurveCrvAPY";
import { useCurveSNXAPY } from "./useCurveSNXAPY";
import { CurvePairs } from "../CurvePairs";
import { useUniPairDayData } from "./useUniPairDayData";
import { useSushiPairDayData } from "./useSushiPairDayData";
import { useYearnData } from "./useYearnData";
import { useDuneData } from "./useDuneData";
import {
  formatEther,
  formatUnits,
  getJsonWalletAddress,
} from "ethers/lib/utils";
import { UniV2Pairs } from "../UniV2Pairs";
import erc20 from "@studydefi/money-legos/erc20";

import { Connection } from "../Connection";
import { SushiPairs, addresses } from "../SushiPairs";
import { useCurveLdoAPY } from "./useCurveLdoAPY";
import { Contract } from "@ethersproject/contracts";
import { Contract as MulticallContract } from "ethers-multicall";

import RewarderABI from "../ABIs/rewarder.json";

const AVERAGE_BLOCK_TIME = 13.22;
const ONE_YEAR_SECONDS = (360 * 24 * 60 * 60)

interface PoolId {
  [key: string]: number;
}

interface PoolInfo {
  [key: string]: {
    poolId: number;
    tokenName: string;
  };
}

const sushiPoolIds: PoolId = {
  "0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f": 2,
  "0x397FF1542f962076d0BFE58eA045FfA2d347ACa0": 1,
  "0x06da0fd433C1A5d7a4faa01111c044910A184553": 0,
  "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58": 21,
  "0x088ee5007C98a9677165D78dD2109AE4a3D04d0C": 11,
  "0x10B47177E92Ef9D5C6059055d92DdF6290848991": 132,
  "0x795065dCc9f64b5614C407a6EFDC400DA6221FB0": 12,
  "0x9461173740D27311b176476FA27e94C681b1Ea6b": 230,
};

const sushiPoolV2Ids: PoolId = {
  "0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8": 0,
  "0x05767d9EF41dC40689678fFca0608878fb3dE906": 1,
  "0xfCEAAf9792139BF714a694f868A215493461446D": 8,
};

const abracadabraIds: PoolId = {
  "0xb5De0C3753b6E1B4dBA616Db82767F17513E6d4E": 0,
  "0x5a6A4D54456819380173272A5E8E9B9904BdF41B": 1,
  "0x07D5695a24904CC1B6e3bd57cC7780B90618e3c4": 2,
};

const convexPools: PoolInfo = {
  "0x06325440D014e39736583c165C2963BA99fAf14E": {
    poolId: 25,
    tokenName: "steth",
  },
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

export const useJarWithAPY = (network: ChainName, jars: Input): Output => {
  const { multicallProvider, provider } = Connection.useContainer();
  const { controller, strategy } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { getPairData: getSushiPairData } = SushiPairs.useContainer();
  const { getPairData: getUniPairData } = UniV2Pairs.useContainer();
  const { getCurveLpPriceData } = CurvePairs.useContainer();
  const {
    stakingRewards,
    sorbettiereFarm,
    susdPool,
    susdGauge,
    renGauge,
    communalFarm,
    renPool,
    threeGauge,
    threePool,
    sushiChef,
    steCRVPool,
    steCRVGauge,
    masterchefV2,
    yearnRegistry,
    cvxBooster,
  } = Contracts.useContainer();
  const { getUniPairDayAPY } = useUniPairDayData();
  const { getSushiPairDayAPY } = useSushiPairDayData();
  const { yearnData } = useYearnData();
  const { duneData } = useDuneData();
  const { rawStats: curveRawStats } = useCurveRawStats(NETWORK_NAMES.ETH);
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

  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );
  const [tvlData, setTVLData] = useState<Array<Object>>([]);

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

      const mirRewardsPerYear = mirRewardRate * ONE_YEAR_SECONDS;
      const valueRewardedPerYear = prices.mir * mirRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const mirAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { mir: getCompoundingAPY(mirAPY * 0.8), apr: mirAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateLqtyStakingAPY = async () => {
    if (duneData) {
      let lqtyApy = 0;

      lqtyApy = duneData?.data?.get_result_by_result_id[0].data?.apr / 100;
      return [
        {
          "auto-compounded ETH and LUSD fees": getCompoundingAPY(lqtyApy * 0.8),
          apr: lqtyApy * 0.8 * 100,
        },
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

      const mirRewardsPerYear = lqtyRewardRate * ONE_YEAR_SECONDS;
      const valueRewardedPerYear = prices.lqty * mirRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const lqtyAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { lqty: getCompoundingAPY(lqtyAPY * 0.8), apr: lqtyAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateAbradabraApy = async (lpTokenAddress: string) => {
    if (
      sorbettiereFarm &&
      prices?.mim &&
      prices?.spell &&
      getCurveLpPriceData &&
      getSushiPairData &&
      multicallProvider
    ) {
      const poolId = abracadabraIds[lpTokenAddress];

      const multicallSorbettiereFarm = new MulticallContract(
        sorbettiereFarm.address,
        sorbettiereFarm.interface.fragments,
      );
      const lpToken = new MulticallContract(lpTokenAddress, erc20.abi);

      const [
        icePerSecondBN,
        totalAllocPointBN,
        poolInfo,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallSorbettiereFarm.icePerSecond(),
        multicallSorbettiereFarm.totalAllocPoint(),
        multicallSorbettiereFarm.poolInfo(poolId),
        lpToken.balanceOf(multicallSorbettiereFarm.address),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const icePerSecond =
        (parseFloat(formatEther(icePerSecondBN)) * poolInfo.allocPoint) /
        totalAllocPointBN.toNumber();
      let tokenPrice: any;
      if (lpTokenAddress === JAR_DEPOSIT_TOKENS.Ethereum.MIM_3CRV) {
        tokenPrice = await getCurveLpPriceData(lpTokenAddress);
      } else {
        const { pricePerToken } = await getSushiPairData(lpTokenAddress);
        tokenPrice = pricePerToken;
      }

      const iceRewardsPerYear = icePerSecond * ONE_YEAR_SECONDS;
      const valueRewardedPerYear = prices.spell * iceRewardsPerYear;

      const totalValueStaked = totalSupply * tokenPrice;
      const spellAPY = valueRewardedPerYear / totalValueStaked;

      // no more UNI being distributed
      return [
        { spell: getCompoundingAPY(spellAPY * 0.8), apr: spellAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateSaddleD4APY = async () => {
    const swapFlashLoanAddress = "0xC69DDcd4DFeF25D8a793241834d4cc4b3668EAD6";
    if (communalFarm && multicallProvider && prices) {
      const multicallCommunalFarm = new MulticallContract(
        COMMUNAL_FARM,
        communalFarm.interface.fragments,
      );

      const [
        fxsRateBN,
        tribeRateBN,
        alcxRateBN,
        lqtyRateBN,
        totalValueLockedBN,
      ] = await multicallProvider.all([
        multicallCommunalFarm.rewardRates(0),
        multicallCommunalFarm.rewardRates(1),
        multicallCommunalFarm.rewardRates(2),
        multicallCommunalFarm.rewardRates(3),
        multicallCommunalFarm.totalLiquidityLocked(),
      ]);

      const valueRewardedPerYear =
        prices.fxs * parseFloat(formatEther(fxsRateBN)) * ONE_YEAR_SECONDS +
        prices.tribe *
          parseFloat(formatEther(tribeRateBN)) *
          ONE_YEAR_SECONDS +
        prices.alcx *
          parseFloat(formatEther(alcxRateBN)) *
          ONE_YEAR_SECONDS +
        prices.lqty *
          parseFloat(formatEther(lqtyRateBN)) *
          ONE_YEAR_SECONDS;

      const multicallSwapFlashLoan = new MulticallContract(
        swapFlashLoanAddress,
        SwapFlashLoanABI,
      );

      const [virtualPrice] = await multicallProvider.all([
        multicallSwapFlashLoan.getVirtualPrice(),
      ]);
      const priceOfSaddle = parseFloat(formatEther(virtualPrice));
      const totalValueStaked =
        parseFloat(formatEther(totalValueLockedBN)) * priceOfSaddle;

      const saddled4Apy = valueRewardedPerYear / totalValueStaked;

      return [
        {
          "LQTY+FXS+TRIBE+ALCX": getCompoundingAPY(saddled4Apy * 0.8),
          apr: saddled4Apy * 0.8 * 100,
        },
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

      const tribeRewardsPerYear = tribeRewardRate * ONE_YEAR_SECONDS;
      const valueRewardedPerYear = prices.tribe * tribeRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const tribeAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { tribe: getCompoundingAPY(tribeAPY * 0.8), apr: tribeAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateFoxAPY = async (rewardsAddress: string) => {
    if (stakingRewards && prices?.fox && getUniPairData && multicallProvider) {
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
      const foxRewardRate = parseFloat(formatEther(rewardRateBN));

      const { pricePerToken } = await getUniPairData(stakingToken);

      const foxRewardsPerYear = foxRewardRate * ONE_YEAR_SECONDS;
      const valueRewardedPerYear = prices.fox * foxRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const foxAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { fox: getCompoundingAPY(foxAPY * 0.8), apr: foxAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateMCv2APY = async (
    lpTokenAddress: string,
    rewardToken: PriceIds,
  ) => {
    if (masterchefV2 && prices && getSushiPairData && provider) {
      const poolId = sushiPoolV2Ids[lpTokenAddress];

      const rewarder_addr = await masterchefV2.rewarder(poolId);

      const rewarder = new Contract(rewarder_addr, RewarderABI, provider);
      const lpToken = new Contract(lpTokenAddress, erc20.abi, provider);
      const totalSupplyBN = await lpToken.balanceOf(masterchefV2.address);
      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const { pricePerToken } = await getSushiPairData(lpTokenAddress);

      let rewardsPerYear = 0;
      if (rewardToken === "alcx") {
        const tokenPerBlockBN = await rewarder.tokenPerBlock();
        rewardsPerYear =
          (parseFloat(formatEther(tokenPerBlockBN)) * ONE_YEAR_SECONDS) /
          AVERAGE_BLOCK_TIME;
      } else if (rewardToken === "cvx") {
        const tokenPerSecondBN = await rewarder.rewardRate();
        rewardsPerYear =
          parseFloat(formatEther(tokenPerSecondBN)) * ONE_YEAR_SECONDS;
      } else if (rewardToken === "tru") {
        const tokenPerSecondBN = await rewarder.rewardPerSecond();
        rewardsPerYear =
          parseFloat(formatUnits(tokenPerSecondBN, 8)) * ONE_YEAR_SECONDS;
      }

      const valueRewardedPerYear = prices[rewardToken] * rewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const rewardAPY = valueRewardedPerYear / totalValueStaked;

      return [
        {
          [rewardToken]: getCompoundingAPY(rewardAPY * 0.8),
          apr: rewardAPY * 0.8 * 100,
        },
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
        sushiRewardsPerBlock * (ONE_YEAR_SECONDS / AVERAGE_BLOCK_TIME);
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
        sushiRewardsPerBlock * (ONE_YEAR_SECONDS / AVERAGE_BLOCK_TIME);
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

  const calculateConvexAPY = async (lpTokenAddress: string) => {
    const curveAPY = (await fetch(
      "https://cors.bridged.cc/https://www.convexfinance.com/api/curve-apys",
      {
        method: "GET",
        headers: new Headers({
          "X-Requested-With": "XMLHttpRequest"
        }),
      },
    ).then((x) => x.json()))?.apys;
    const cvxPool = convexPools[lpTokenAddress];
    if (curveAPY && cvxBooster && multicallProvider && prices) {
      const lpApy = parseFloat(curveAPY.[cvxPool.tokenName]?.baseApy);
      const crvApy = parseFloat(curveAPY.[cvxPool.tokenName]?.crvApy);
      const rewardApy = parseFloat(curveAPY.[cvxPool.tokenName]?.additionalRewards[0].apy);

      const poolInfo = await cvxBooster.poolInfo(cvxPool.poolId)

      const crvRewardsMC = new MulticallContract(
        poolInfo.crvRewards,
        CrvRewardsABI,
      );

      const [crvReward, depositLocked, duration] = await multicallProvider.all([
        crvRewardsMC.currentRewards(),
        crvRewardsMC.totalSupply(),
        crvRewardsMC.duration()
      ])

      const isStEth = cvxPool.tokenName === "steth"
      
      const poolValue = parseFloat(formatEther(depositLocked)) * ( isStEth ? prices.eth : 0);
      
      const cvxReward = await getCvxMint(parseFloat(formatEther(crvReward)))
      const cvxValuePerYear = cvxReward * prices.cvx * ONE_YEAR_SECONDS / duration.toNumber(); 
      
      const cvxApy = cvxValuePerYear / poolValue * 100

      return [{ lp: lpApy}, {crv: crvApy * 0.8, apr: crvApy * 0.8 }, {cvx: cvxApy * 0.8, apr: cvxApy *0.8}, {ldo: rewardApy * 0.8, apr: rewardApy * 0.8}];
    }
    return [];
  };

  /* Adapted from https://docs.convexfinance.com/convexfinanceintegration/cvx-minting */

  // constants
  const cliffSize = 100000; // new cliff every 100,000 tokens
  const cliffCount = 1000; // 1,000 cliffs
  const maxSupply = 100000000; // 100 mil max supply

  const getCvxMint = async (crvEarned: number): Promise<number> => {
    const cvx = Erc20Factory.connect(addresses.cvx, provider)
  
    // first get total supply
    const cvxTotalSupply = parseFloat(formatEther((await cvx.totalSupply())))
  
    // get current cliff
    const currentCliff = cvxTotalSupply / cliffSize;
  
    // if current cliff is under the max
    if (currentCliff < cliffCount) {
      // get remaining cliffs
      const remaining = cliffCount - currentCliff;
  
      // multiply ratio of remaining cliffs to total cliffs against amount CRV received
      let cvxEarned = (crvEarned * remaining) / cliffCount;
  
      // double check we have not gone over the max supply
      const amountTillMax = maxSupply - cvxTotalSupply;
      if (cvxEarned > amountTillMax) {
        cvxEarned = amountTillMax;
      }
      return cvxEarned;
    }
    return 0;
  }

  const calculateYearnAPY = async (depositToken: string) => {
    if (yearnRegistry && yearnData) {
      const vault = await yearnRegistry.latestVault(depositToken, {
        gasLimit: 1000000,
      });
      const vaultData = yearnData.find(
        (x) => x.address.toLowerCase() === vault.toLowerCase(),
      );
      if (vaultData) {
        const apr = vaultData?.apy?.data?.netApy || 0;
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
        sushiEthDaiApy,
        sushiEthUsdcApy,
        sushiEthUsdtApy,
        sushiEthWBtcApy,
        sushiEthYfiApy,
        sushiEthApy,
        sushiEthAlcxApy,
        sushiTruEthApy,
      ] = await Promise.all([
        calculateSushiAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_DAI),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_USDC),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_USDT),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_WBTC),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_YFI),
        calculateSushiAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH),
        calculateSushiV2APY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_ALCX,
        ),
        calculateSushiV2APY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_TRU_ETH,
        ),
      ]);

      const [
        sushiEthyveCRVApy,
        sushiEthyvboostApy,
        usdcApy,
        crvLusdApy,
        crvFraxApy,
        crvIBApy,
        alcxEthAlcxApy,
        cvxEthApy,
        sushiCvxEthApy,
        truEthApy,
        steCRVApy,
      ] = await Promise.all([
        calculateSushiAPY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_YVECRV,
        ),
        calculateSushiAPY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_YVBOOST,
        ),
        calculateYearnAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].USDC),
        calculateYearnAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].lusdCRV),
        calculateYearnAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].fraxCRV),
        calculateYearnAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].ibCRV),
        calculateMCv2APY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_ALCX,
          "alcx",
        ),
        calculateMCv2APY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_CVX_ETH,
          "cvx",
        ),
        calculateSushiV2APY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_CVX_ETH,
        ),
        calculateMCv2APY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_TRU_ETH,
          "tru",
        ),
        calculateConvexAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].steCRV)
      ]);

      const [
        mirrorMirUstApy,
        mirrorMtslaUstApy,
        mirrorMaaplUstApy,
        mirrorMqqqUstApy,
        mirrorMslvUstApy,
        mirrorMbabaUstApy,
        feiTribeApy,
        foxEthApy,
        lqtyEthLusdApy,
        lqtyApy,
        saddled4Apy,
      ] = await Promise.all([
        calculateMirAPY(MIRROR_MIR_UST_STAKING_REWARDS),
        calculateMirAPY(MIRROR_MTSLA_UST_STAKING_REWARDS),
        calculateMirAPY(MIRROR_MAAPL_UST_STAKING_REWARDS),
        calculateMirAPY(MIRROR_MQQQ_UST_STAKING_REWARDS),
        calculateMirAPY(MIRROR_MSLV_UST_STAKING_REWARDS),
        calculateMirAPY(MIRROR_MBABA_UST_STAKING_REWARDS),
        calculateFeiAPY(FEI_TRIBE_STAKING_REWARDS),
        calculateFoxAPY(FOX_ETH_STAKING_REWARDS),
        calculateLqtyAPY(LQTY_LUSD_ETH_STAKING_REWARDS),
        calculateLqtyStakingAPY(),
        calculateSaddleD4APY(),
      ]);

      const [mim3crvApy, mimEthApy, spellEthApy] = await Promise.all([
        calculateAbradabraApy(JAR_DEPOSIT_TOKENS.Ethereum.MIM_3CRV),
        calculateAbradabraApy(JAR_DEPOSIT_TOKENS.Ethereum.MIM_ETH),
        calculateAbradabraApy(JAR_DEPOSIT_TOKENS.Ethereum.SPELL_ETH),
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
          APYs = [...steCRVApy];
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

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MIR_UST) {
          APYs = [
            ...mirrorMirUstApy,
            ...getUniPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MIR_UST,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MTSLA_UST) {
          APYs = [
            ...mirrorMtslaUstApy,
            ...getUniPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MTSLA_UST,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MAAPL_UST) {
          APYs = [
            ...mirrorMaaplUstApy,
            ...getUniPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MAAPL_UST,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MQQQ_UST) {
          APYs = [
            ...mirrorMqqqUstApy,
            ...getUniPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MQQQ_UST,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MSLV_UST) {
          APYs = [
            ...mirrorMslvUstApy,
            ...getUniPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MSLV_UST,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MBABA_UST) {
          APYs = [
            ...mirrorMbabaUstApy,
            ...getUniPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MBABA_UST,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_FEI_TRIBE) {
          APYs = [
            ...feiTribeApy,
            ...getUniPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_FEI_TRIBE,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_FOX_ETH) {
          APYs = [
            ...foxEthApy,
            ...getUniPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_FOX_ETH,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_LUSD_ETH) {
          APYs = [
            ...lqtyEthLusdApy,
            ...getUniPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_LUSD_ETH,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_DAI) {
          APYs = [
            ...sushiEthDaiApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_DAI,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_USDC) {
          APYs = [
            ...sushiEthUsdcApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_USDC,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_USDT) {
          APYs = [
            ...sushiEthUsdtApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_USDT,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_WBTC) {
          APYs = [
            ...sushiEthWBtcApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_WBTC,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_YFI) {
          APYs = [
            ...sushiEthYfiApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_YFI,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_YVECRV) {
          APYs = [
            ...sushiEthyveCRVApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_YVECRV,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_YVBOOST) {
          APYs = [
            ...sushiEthyvboostApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_YVBOOST,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH) {
          APYs = [
            ...sushiEthApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_ALCX) {
          APYs = [
            ...alcxEthAlcxApy,
            ...sushiEthAlcxApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_ETH_ALCX,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SADDLE_D4) {
          APYs = [...saddled4Apy];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.USDC) {
          APYs = [...usdcApy];
          totalAPY = usdcApy[0]?.apr || 0;
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.lusdCRV) {
          APYs = [...crvLusdApy];
          totalAPY = crvLusdApy[0]?.apr || 0;
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.MIM_3CRV) {
          APYs = [...mim3crvApy];
        }
        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.MIM_ETH) {
          APYs = [
            ...mimEthApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].MIM_ETH,
            ),
          ];
        }
        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SPELL_ETH) {
          APYs = [
            ...spellEthApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SPELL_ETH,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.fraxCRV) {
          APYs = [...crvFraxApy];
          totalAPY = crvFraxApy[0]?.apr || 0;
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.ibCRV) {
          APYs = [...crvIBApy];
          totalAPY = crvIBApy[0]?.apr || 0;
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_CVX_ETH) {
          APYs = [
            ...cvxEthApy,
            ...sushiCvxEthApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_CVX_ETH,
            ),
          ];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.LQTY) {
          APYs = [...lqtyApy];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_TRU_ETH) {
          APYs = [
            ...truEthApy,
            ...sushiTruEthApy,
            ...getSushiPairDayAPY(
              JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SUSHI_TRU_ETH,
            ),
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
    if (network === NETWORK_NAMES.ETH) calculateAPY();
  }, [jars?.length, prices, network]);

  return { jarsWithAPY };
};
