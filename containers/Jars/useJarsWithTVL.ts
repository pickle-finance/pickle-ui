import { Contract, ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useEffect, useState } from "react";

import { Contracts } from "../Contracts";
import { Prices } from "../Prices";

import { STRATEGY_NAMES, DEPOSIT_TOKENS_JAR_NAMES, getPriceId } from "./jars";
import { JarWithAPY } from "./useJarsWithAPYEth";

import { Connection } from "../Connection";
import { NETWORK_NAMES } from "containers/config";

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
    jarName === DEPOSIT_TOKENS_JAR_NAMES.renCRV ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.steCRV ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.AM3CRV ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.lusdCRV
  );
};

// UniV2/SLP pools
const isUniPool = (jarName: string): boolean => {
  return (
    // jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_USDC ||
    // jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_USDT ||
    // jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_WBTC ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_DAI ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_YFI ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MIR_UST ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MTSLA_UST ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MAAPL_UST ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MQQQ_UST ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MSLV_UST ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_MBABA_UST ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_FEI_TRIBE ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_YVBOOST ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_ETH_ALCX ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.COMETH_USDC_WETH ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.COMETH_PICKLE_MUST ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.COMETH_MATIC_MUST ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.POLY_SUSHI_ETH_USDT ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.POLY_SUSHI_MATIC_ETH ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.QUICK_MIMATIC_USDC ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.UNIV2_LUSD_ETH ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_CVX_ETH
  );
};

const isAavePool = (jarName: string): boolean => {
  return jarName === DEPOSIT_TOKENS_JAR_NAMES.DAI;
};
const isLqtyPool = (jarName: string): boolean => {
  return jarName === DEPOSIT_TOKENS_JAR_NAMES.LQTY;
};

export const useJarWithTVL = (jars: Input): Output => {
  const { multicallProvider, chainName } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  const {
    uniswapv2Pair,
    susdPool,
    renPool,
    steCRVPool,
    threePool,
    lusdPool,
    am3crvPool,
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

    if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.steCRV) {
      pool = steCRVPool;
      pricePerUnderlying = prices?.eth;
    }

    if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.AM3CRV) {
      pool = am3crvPool;
      pricePerUnderlying = prices?.dai;
    }

    if (jar.jarName === DEPOSIT_TOKENS_JAR_NAMES.lusdCRV) {
      pool = lusdPool;
      pricePerUnderlying = prices?.dai;
    }

    if (!pool || !pricePerUnderlying || !multicallProvider) {
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };
    }

    const multicallJarContract = new Contract(
      jar.contract.address,
      jar.contract.interface.fragments,
      multicallProvider,
    );

    const multicallPoolContract = new Contract(
      pool.address,
      pool.interface.fragments,
      multicallProvider,
    );

    const [supply, balance, virtualPrice, ratio] = (
      await Promise.all([
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

  const measureLqtyJarTVL = async (jar: JarWithAPY) => {
    if (!prices)
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };

    const [supply, balance, ratio] = (
      await Promise.all([
        jar.contract.totalSupply(),
        jar.contract.balance().catch(() => ethers.BigNumber.from(0)),
        jar.contract.getRatio().catch(() => ethers.utils.parseEther("1")),
      ])
    ).map((x) => parseFloat(formatEther(x)));

    const tvlUSD = balance * prices.lqty;
    const usdPerPToken = tvlUSD / supply;
    return { ...jar, tvlUSD, usdPerPToken, ratio };
  };

  const measureUniJarTVL = async (jar: JarWithAPY) => {
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
      jar.contract.totalSupply().catch(() => ethers.BigNumber.from(0)),
      jar.contract.balance().catch(() => ethers.BigNumber.from(0)),
      uniPair.totalSupply(),
      uniPair.token0(),
      uniPair.token1(),
      jar.contract.getRatio().catch(() => ethers.utils.parseEther("1")),
    ]);

    const Token0 = uniswapv2Pair.attach(token0);
    const Token1 = uniswapv2Pair.attach(token1);

    const [
      token0InPool,
      token1InPool,
      token0Decimal,
      token1Decimal,
    ] = await Promise.all([
      Token0.balanceOf(uniPair.address),
      Token1.balanceOf(uniPair.address),
      Token0.decimals(),
      Token1.decimals(),
    ]);

    const dec18 = parseEther("1");

    const token0PerUni = token0InPool.mul(dec18).div(totalUNI);
    const token1PerUni = token1InPool.mul(dec18).div(totalUNI);

    const token0Bal = parseFloat(
      ethers.utils.formatUnits(
        token0PerUni.mul(balance).div(dec18),
        token0Decimal,
      ),
    );

    const token1Bal = parseFloat(
      ethers.utils.formatUnits(
        token1PerUni.mul(balance).div(dec18),
        token1Decimal,
      ),
    );

    const token0PriceId = getPriceId(token0);
    const token1PriceId = getPriceId(token1);

    let tvlUSD;
    if (prices[token0PriceId]) {
      tvlUSD = 2 * token0Bal * prices[token0PriceId];
    } else {
      tvlUSD = 2 * token1Bal * prices[token1PriceId];
    }

    const usdPerPToken = tvlUSD / parseFloat(formatEther(supply));
    return {
      ...jar,
      tvlUSD,
      usdPerPToken,
      ratio: parseFloat(formatEther(ratio)),
    };
  };

  const measureAaveTVL = async (jar: JarWithAPY) => {
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
    if (jars) {
      const promises: Array<Promise<JarWithTVL>> = jars.map(async (jar) => {
        if (isCurvePool(jar.jarName)) {
          return measureCurveTVL(jar);
        } else if (isUniPool(jar.jarName)) {
          return measureUniJarTVL(jar);
        } else if (isAavePool(jar.jarName)) {
          return measureAaveTVL(jar);
        } else if (isLqtyPool(jar.jarName)) {
          return measureLqtyJarTVL(jar);
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
  }, [chainName, jars, prices]);

  return {
    jarsWithTVL,
  } as Output;
};
