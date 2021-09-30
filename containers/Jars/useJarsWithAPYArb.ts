import { useEffect, useState } from "react";
import {
  DEPOSIT_TOKENS_JAR_NAMES,
  getPriceId,
  JAR_DEPOSIT_TOKENS,
  PICKLE_JARS,
} from "./jars";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { PriceIds, Prices } from "../Prices";
import { Contracts } from "../Contracts";
import { Jar } from "./useFetchJars";
import { NETWORK_NAMES, ChainName } from "containers/config";
import { Connection } from "../Connection";
import { SushiPairs } from "../SushiPairs";
import { Contract as MulticallContract } from "ethers-multicall";
import erc20, { wbtc } from "@studydefi/money-legos/erc20";
import { Contract } from "@ethersproject/contracts";
import RewarderABI from "../ABIs/rewarder.json";
import PoolABI from "../ABIs/pool.json";
import { CurvePairs } from "containers/CurvePairs";
import { useCurveRawStats } from "./useCurveRawStats";

const AVERAGE_BLOCK_TIME = 4;
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

const swap_abi = ["function balances(uint256) view returns(uint256)"];

export interface JarApy {
  [k: string]: number;
}

interface PoolId {
  [key: string]: number;
}
export const tricryptoInfo: {
  swapAddress: string;
  gauge: string;
  tokenInfo: {
    decimals: number[];
    tokens: string[];
  } 
} = {
  swapAddress: "0x960ea3e3C7FB317332d990873d354E18d7645590",
  gauge: "0x97E2768e8E73511cA874545DC5Ff8067eB19B787",
  tokenInfo: {
    decimals: [1e6, 1e8, 1e18], // USDT, WBTC, WETH
    tokens: ["usdt", "wbtc", "eth"],
  }
}

const sushiPoolIds: PoolId = {
  "0xb6DD51D5425861C808Fd60827Ab6CFBfFE604959": 9,
  "0x8f93Eaae544e8f5EB077A1e09C1554067d9e2CA8": 11,
};

const abracadabraIds: PoolId = {
  "0x30dF229cefa463e991e29D42DB0bae2e122B2AC7": 0,
};

const getCompoundingAPY = (apr: number) => {
  return 100 * (Math.pow(1 + apr / 365, 365) - 1);
};

export interface JarWithAPY extends Jar {
  totalAPY: number;
  apr: number;
  lp: number;
  APYs: Array<JarApy>;
}

type Input = Array<Jar> | null;
type Output = {
  jarsWithAPY: Array<JarWithAPY> | null;
};

export const useJarWithAPY = (network: ChainName, jars: Input): Output => {
  const { multicallProvider, provider } = Connection.useContainer();
  const { sushiMinichef, sorbettiereFarm } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { getCurveLpPriceData } = CurvePairs.useContainer();
  const { getPairData: getSushiPairData } = SushiPairs.useContainer();
  const { rawStats: curveRawStats } = useCurveRawStats(NETWORK_NAMES.ARB);
  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );

  const calculateSushiAPY = async (lpTokenAddress: string) => {
    if (
      sushiMinichef &&
      prices?.sushi &&
      getSushiPairData &&
      multicallProvider
    ) {
      const poolId = sushiPoolIds[lpTokenAddress];
      const multicallsushiMinichef = new MulticallContract(
        sushiMinichef.address,
        sushiMinichef.interface.fragments,
      );
      const lpToken = new MulticallContract(lpTokenAddress, erc20.abi);

      const [
        sushiPerSecondBN,
        totalAllocPointBN,
        poolInfo,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallsushiMinichef.sushiPerSecond(),
        multicallsushiMinichef.totalAllocPoint(),
        multicallsushiMinichef.poolInfo(poolId),
        lpToken.balanceOf(sushiMinichef.address),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const sushiRewardsPerSecond =
        (parseFloat(formatEther(sushiPerSecondBN)) *
          poolInfo.allocPoint.toNumber()) /
        totalAllocPointBN.toNumber();

      const { pricePerToken } = await getSushiPairData(lpTokenAddress);

      const sushiRewardsPerYear = sushiRewardsPerSecond * (365 * 24 * 60 * 60);
      const valueRewardedPerYear = prices.sushi * sushiRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const sushiAPY = valueRewardedPerYear / totalValueStaked;

      return [
        { sushi: getCompoundingAPY(sushiAPY * 0.8), apr: sushiAPY * 0.8 * 100 },
      ];
    }

    return [];
  };

  const calculateMCv2APY = async (
    lpTokenAddress: string,
    rewardToken: PriceIds,
  ) => {
    if (sushiMinichef && prices && getSushiPairData && provider) {
      const poolId = sushiPoolIds[lpTokenAddress];

      const rewarder_addr = await sushiMinichef.rewarder(poolId);
      const rewarder = new Contract(rewarder_addr, RewarderABI, provider);
      const lpToken = new Contract(lpTokenAddress, erc20.abi, provider);
      const totalSupplyBN = await lpToken.balanceOf(sushiMinichef.address);
      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const { pricePerToken } = await getSushiPairData(lpTokenAddress);

      let rewardsPerYear = 0;
      if (rewardToken === "spell") {
        const tokenPerSecondBN = await rewarder.rewardPerSecond();
        rewardsPerYear =
          parseFloat(formatEther(tokenPerSecondBN)) * ONE_YEAR_SECONDS;
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
      if (lpTokenAddress === JAR_DEPOSIT_TOKENS.Arbitrum.MIM_2CRV) {
        tokenPrice = await getCurveLpPriceData(lpTokenAddress);
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

  const calculateCurveApy = async (lpTokenAddress: string) => {
    if (multicallProvider && erc20 && prices) {
      let swapAddress;
      let gauge;
      let tokenInfo
      if (lpTokenAddress === JAR_DEPOSIT_TOKENS.Arbitrum.CRV_TRICRYPTO) {
        swapAddress = tricryptoInfo.swapAddress;
        gauge = tricryptoInfo.gauge;
        tokenInfo = tricryptoInfo.tokenInfo;
      }
      const swap = new MulticallContract(swapAddress, swap_abi);
      const [
        balance0,
        balance1,
        balance2,
      ] = await multicallProvider.all([
        swap.balances(0),
        swap.balances(1),
        swap.balances(2),
      ]);

      const scaledBalance0 =
        (balance0 / tokenInfo.decimals[0]) * prices[tokenInfo.tokens[0]];
      const scaledBalance1 =
        (balance1 / tokenInfo.decimals[1]) * prices[tokenInfo.tokens[1]];
      const scaledBalance2 =
        (balance2 / tokenInfo.decimals[2]) * prices[tokenInfo.tokens[2]];

      const totalStakedUsd = scaledBalance0 + scaledBalance1 + scaledBalance2;

      const crvRewardsAmount = prices.crv * 3500761; // Approximation of CRV emissions

      const crvAPY = crvRewardsAmount / totalStakedUsd;
      return [
        {
          crv: getCompoundingAPY(crvAPY * 0.8 || 0),
          apr: crvAPY * 100 * 0.8 || 0,
        },
      ];
    }

    return [];
  };

  const calculateAPY = async () => {
    if (jars) {
      const [
        sushiMimEthApy,
        spellMimEthApy,
        sushiSpellEthApy,
        spellEthApy,
        mim2crvApy,
        tricryptoApy,
      ] = await Promise.all([
        calculateSushiAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ARB].SUSHI_MIM_ETH),
        calculateMCv2APY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ARB].SUSHI_MIM_ETH,
          "spell",
        ),
        calculateSushiAPY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ARB].SUSHI_SPELL_ETH,
        ),
        calculateMCv2APY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ARB].SUSHI_SPELL_ETH,
          "spell",
        ),
        calculateAbradabraApy(JAR_DEPOSIT_TOKENS.Arbitrum.MIM_2CRV),
        calculateCurveApy(JAR_DEPOSIT_TOKENS.Arbitrum.CRV_TRICRYPTO),
      ]);
      const promises = jars.map(async (jar) => {
        let APYs: Array<JarApy> = [];

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_MIM_ETH) {
          APYs = [...sushiMimEthApy, ...spellMimEthApy];
        }
        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_SPELL_ETH) {
          APYs = [...sushiSpellEthApy, ...spellEthApy];
        }
        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.MIM_2CRV) {
          APYs = [...mim2crvApy];
        }
        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.CRV_TRICRYPTO) {
          APYs = [{lp: (curveRawStats?.tricrypto || 0)}, ...tricryptoApy ];
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

        const totalAPY = (apr * 100) / 100 + lp;

        return {
          ...jar,
          APYs,
          totalAPY,
          apr,
          lp,
        };
      });
      const newJarsWithAPY = await Promise.all(promises);

      setJarsWithAPY(newJarsWithAPY);
    }
  };
  useEffect(() => {
    if (network === NETWORK_NAMES.ARB) calculateAPY();
  }, [jars?.length, prices, network]);

  return { jarsWithAPY };
};
