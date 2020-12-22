import { ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import erc20 from "@studydefi/money-legos/erc20";

import { Contracts } from "../Contracts";
import { Prices } from "../Prices";

import { STRATEGY_NAMES, DEPOSIT_TOKENS_JAR_NAMES, getPriceId } from "./jars";
import { JarWithAPY } from "./useJarsWithAPY";

import { Contract as MulticallContract } from "ethers-multicall";
import { Connection } from "../Connection";

export interface JarWithTVL extends JarWithAPY {
  tvlUSD: null | number;
  usdPerPToken: null | number;
  ratio: null | number;
}

type Input = Array<JarWithAPY> | null;
type Output = {
  jarsWithTVL: Array<JarWithTVL> | null;
};

const isCurvePool = (jarName: string): boolean => {
  return (
    jarName === DEPOSIT_TOKENS_JAR_NAMES.sCRV ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES["3CRV"] ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.renCRV
  );
};

const isUniswapPool = (jarName: string): boolean => {
  return (
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_ETH_DAI ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_ETH_DAI_OLD ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_ETH_USDC ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_ETH_USDC_OLD ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_ETH_USDT ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_ETH_USDT_OLD ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_ETH_WBTC
  );
};

const isSushiswapPool = (jarName: string): boolean => {
  return (
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_DAI ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_USDC ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_USDT ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_WBTC ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_YFI
  );
};

export const useJarWithTVL = (jars: Input): Output => {
  const { multicallProvider } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  const {
    uniswapv2Pair,
    susdPool,
    renPool,
    threePool,
  } = Contracts.useContainer();

  const [jarsWithTVL, setJarsWithTVL] = useState<Array<JarWithTVL> | null>(
    null,
  );

  const measureCurveTVL = async (jar: JarWithAPY) => {
    let pool;
    let pricePerUnderlying;

    if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.sCRV) {
      pool = susdPool;
      pricePerUnderlying = prices?.dai;
    }

    if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES["3CRV"]) {
      pool = threePool;
      pricePerUnderlying = prices?.dai;
    }

    if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.renCRV) {
      pool = renPool;
      pricePerUnderlying = prices?.wbtc;
    }

    if (!pool || !pricePerUnderlying || !multicallProvider) {
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };
    }

    const multicallJarContract = new MulticallContract(
      jar.contract.address,
      jar.contract.interface.fragments,
    );

    const multicallPoolContract = new MulticallContract(
      pool.address,
      pool.interface.fragments,
    );

    const [supply, balance, virtualPrice, ratio] = (
      await multicallProvider.all([
        multicallJarContract.totalSupply(),
        multicallJarContract.balance(),
        multicallPoolContract.get_virtual_price(),
        multicallJarContract.getRatio(),
      ])
    ).map((x) => parseFloat(formatEther(x)));

    const tvlUSD = balance * virtualPrice * pricePerUnderlying;

    const usdPerPToken = tvlUSD / supply;

    return { ...jar, tvlUSD, usdPerPToken, ratio };
  };

  const measureUniswapAndSushiswapTVL = async (jar: JarWithAPY) => {
    if (!uniswapv2Pair || !prices) {
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };
    }

    const uniPair = uniswapv2Pair.attach(jar.depositToken.address);

    const [
      supply,
      balance,
      totalUNI,
      token0,
      token1,
      ratio,
    ] = await Promise.all([
      jar.contract.totalSupply(),
      jar.contract.balance().catch(() => ethers.BigNumber.from(0)),
      uniPair.totalSupply(),
      uniPair.token0(),
      uniPair.token1(),
      jar.contract.getRatio().catch(() => ethers.utils.parseEther("1")),
    ]);

    const WEth = uniswapv2Pair.attach(erc20.weth.address);

    const otherToken =
      token0.toLowerCase() === erc20.weth.address.toLowerCase()
        ? token1
        : token0;

    const OtherToken = uniswapv2Pair.attach(otherToken);

    const [wethInPool, otherTokenInPool, otherTokenDec] = await Promise.all([
      WEth.balanceOf(uniPair.address),
      OtherToken.balanceOf(uniPair.address),
      OtherToken.decimals(),
    ]);

    const dec18 = parseEther("1");

    const otherTokenPerUni = otherTokenInPool.mul(dec18).div(totalUNI);
    const wethPerUni = wethInPool.mul(dec18).div(totalUNI);

    const otherTokenBal = parseFloat(
      ethers.utils.formatUnits(
        otherTokenPerUni.mul(balance).div(dec18),
        otherTokenDec,
      ),
    );
    const wethBal = parseFloat(
      ethers.utils.formatEther(wethPerUni.mul(balance).div(dec18)),
    );

    const otherTokenPriceId = getPriceId(otherToken);
    const tvlUSD =
      otherTokenBal * prices[otherTokenPriceId] + wethBal * prices.eth;

    const usdPerPToken = tvlUSD / parseFloat(formatEther(supply));

    return {
      ...jar,
      tvlUSD,
      usdPerPToken,
      ratio: parseFloat(formatEther(ratio)),
    };
  };

  const measureCompoundTVL = async (jar: JarWithAPY) => {
    if (!prices) {
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };
    }

    const [supply, balance, ratio] = (
      await Promise.all([
        jar.contract.totalSupply(),
        jar.contract.balance().catch(() => ethers.BigNumber.from(0)),
        jar.contract.getRatio().catch(() => ethers.utils.parseEther("1")),
      ])
    ).map((x) => parseFloat(formatEther(x)));

    const priceId = getPriceId(jar.depositToken.address);

    const tvlUSD = prices[priceId] * balance;

    const usdPerPToken = tvlUSD / supply;

    return {
      ...jar,
      tvlUSD,
      usdPerPToken,
      ratio,
    };
  };

  const measureTVL = async () => {
    if (jars && susdPool) {
      const promises: Array<Promise<JarWithTVL>> = jars.map(async (jar) => {
        if (isCurvePool(jar.jarName)) {
          return measureCurveTVL(jar);
        } else if (isUniswapPool(jar.jarName)) {
          return measureUniswapAndSushiswapTVL(jar);
        } else if (isSushiswapPool(jar.jarName)) {
          return measureUniswapAndSushiswapTVL(jar);
        }

        if (jar.strategyName === STRATEGY_NAMES.DAI.COMPOUNDv2) {
          return measureCompoundTVL(jar);
        }

        return {
          ...jar,
          tvlUSD: null,
          usdPerPToken: null,
          ratio: null,
        };
      });
      const jarsWithTVL = await Promise.all(promises);
      setJarsWithTVL(jarsWithTVL);
    }
  };

  useEffect(() => {
    measureTVL();
  }, [jars, prices]);

  return {
    jarsWithTVL,
  } as Output;
};
