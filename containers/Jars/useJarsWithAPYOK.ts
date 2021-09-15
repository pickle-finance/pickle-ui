import { useEffect, useState } from "react";
import {
  DEPOSIT_TOKENS_JAR_NAMES,
  getPriceId,
  JAR_DEPOSIT_TOKENS,
  PICKLE_JARS,
} from "./jars";
import { formatEther } from "ethers/lib/utils";
import { Prices } from "../Prices";
import { Contracts } from "../Contracts";
import { Jar } from "./useFetchJars";
import { NETWORK_NAMES, ChainName } from "containers/config";
import { Connection } from "../Connection";
import { SushiPairs } from "../SushiPairs";
import { Contract as MulticallContract } from "ethers-multicall";
import erc20 from "@studydefi/money-legos/erc20";

const AVERAGE_BLOCK_TIME = 4;

export interface JarApy {
  [k: string]: number;
}

interface PoolId {
  [key: string]: number;
}

const cherryPoolIds: PoolId = {
  "0x8E68C0216562BCEA5523b27ec6B9B6e1cCcBbf88": 1,
  "0x089dedbFD12F2aD990c55A2F1061b8Ad986bFF88": 2,
  "0x94E01843825eF85Ee183A711Fa7AE0C5701A731a": 4,
  "0x407F7a2F61E5bAB199F7b9de0Ca330527175Da93": 5, // Gone for now
  "0xF3098211d012fF5380A03D80f150Ac6E5753caA8": 3,
  "0xb6fCc8CE3389Aa239B2A5450283aE9ea5df9d1A9": 23, // Gone for now
};

const bxhPoolIds: PoolId = {
  "0x04b2C23Ca7e29B71fd17655eb9Bd79953fA79faF": 12,
  "0x3799Fb39b7fA01E23338C1C3d652FB1AB6E7D5BC": 9,
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
  const { cherrychef, bxhchef, erc20: Erc20} = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { getPairData: getSushiPairData } = SushiPairs.useContainer();
  const [jarsWithAPY, setJarsWithAPY] = useState<Array<JarWithAPY> | null>(
    null,
  );

  const calculateCherryAPY = async (lpTokenAddress: string) => {
    if (cherrychef && getSushiPairData && prices && multicallProvider) {
      const poolId = cherryPoolIds[lpTokenAddress];
      const multicallCherrychef = new MulticallContract(
        cherrychef.address,
        cherrychef.interface.fragments,
      );

      const lpToken = new MulticallContract(lpTokenAddress, erc20.abi);

      const [
        cherryPerBlockBN,
        totalAllocPointBN,
        poolInfo,
        bonusMultiplierBN,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallCherrychef.cherryPerBlock(),
        multicallCherrychef.totalAllocPoint(),
        multicallCherrychef.poolInfo(poolId),
        multicallCherrychef.BONUS_MULTIPLIER(),
        lpToken.balanceOf(cherrychef.address),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const rewardsPerBlock =
        (parseFloat(formatEther(cherryPerBlockBN)) *
          poolInfo.allocPoint.toNumber() *
          parseFloat(bonusMultiplierBN.toString())) /
        totalAllocPointBN.toNumber();

      const { pricePerToken } = await getSushiPairData(lpTokenAddress);

      const rewardsPerYear =
        rewardsPerBlock * ((360 * 24 * 60 * 60) / AVERAGE_BLOCK_TIME);

      const valueRewardedPerYear = prices?.cherry * rewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const cherryAPY = valueRewardedPerYear / totalValueStaked;

      return [{ che: cherryAPY * 0.8 * 100, apr: cherryAPY * 0.8 * 100 }];
    }
    return [];
  };

  const calculateBxhAPY = async (lpTokenAddress: string) => {
    if (bxhchef && getSushiPairData && prices && multicallProvider && Erc20) {
      const poolId = bxhPoolIds[lpTokenAddress];

      const lpToken = Erc20.attach(lpTokenAddress);
      const poolInfo = await bxhchef.poolInfo(poolId);

      const [
        bxhPerBlockBN,
        totalAllocPointBN,
        totalSupplyBN,
      ] = await Promise.all([
        bxhchef.rewardV(poolInfo.lastRewardBlock),
        bxhchef.totalAllocPoint(),
        lpToken.balanceOf(bxhchef.address),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      const rewardsPerBlock =
        (parseFloat(formatEther(bxhPerBlockBN)) *
          poolInfo.allocPoint.toNumber()) /
        totalAllocPointBN.toNumber();

      const { pricePerToken } = await getSushiPairData(lpTokenAddress);

      const rewardsPerYear =
        rewardsPerBlock * ((360 * 24 * 60 * 60) / AVERAGE_BLOCK_TIME);

      const valueRewardedPerYear = prices?.bxh * rewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const bxhAPY = valueRewardedPerYear / totalValueStaked;

      return [{ bxh: bxhAPY * 0.8 * 100, apr: bxhAPY * 0.8 * 100 }];
    }
    return [];
  };

  const calculateAPY = async () => {
    if (jars) {
      const [
        cherryCheOktApy,
        cherryCheUsdtApy,
        cherryEthkUsdtApy,
        cherryOktUsdtApy,
        bxhUsdtApy,
        bxhEthBtcApy,
      ] = await Promise.all([
        calculateCherryAPY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.OKEX].CHERRY_OKT_CHE,
        ),
        calculateCherryAPY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.OKEX].CHERRY_USDT_CHE,
        ),
        calculateCherryAPY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.OKEX].CHERRY_ETHK_USDT,
        ),
        calculateCherryAPY(
          JAR_DEPOSIT_TOKENS[NETWORK_NAMES.OKEX].CHERRY_OKT_USDT,
        ),
        calculateBxhAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.OKEX].BXH_BXH_USDT),
        calculateBxhAPY(JAR_DEPOSIT_TOKENS[NETWORK_NAMES.OKEX].BXH_ETH_BTC),
      ]);
      const promises = jars.map(async (jar) => {
        let APYs: Array<JarApy> = [];

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_OKT_CHE) {
          APYs = [...cherryCheOktApy];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_USDT_CHE) {
          APYs = [...cherryCheUsdtApy];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_ETHK_USDT) {
          APYs = [...cherryEthkUsdtApy];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_OKT_USDT) {
          APYs = [...cherryOktUsdtApy];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.BXH_BXH_USDT) {
          APYs = [...bxhUsdtApy];
        }

        if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.BXH_ETH_BTC) {
          APYs = [...bxhEthBtcApy];
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
    if (network === NETWORK_NAMES.OKEX) calculateAPY();
  }, [jars?.length, prices, network]);

  return { jarsWithAPY };
};
