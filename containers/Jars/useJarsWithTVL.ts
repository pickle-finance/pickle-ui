import { useEffect, useState } from "react";

import { JarWithAPY } from "./useJarsWithAPYEth";
import { DEPOSIT_TOKENS_NAME, PICKLE_JARS } from "./jars";
import { PoolData } from "./usePoolData";
import { Contracts } from "containers/Contracts";
import { Prices } from "containers/Prices";
import { Connection } from "containers/Connection";
import { ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { STRATEGY_NAMES, DEPOSIT_TOKENS_JAR_NAMES, getPriceId } from "./jars";
import { NETWORK_NAMES } from "containers/config";
import { Contract as MulticallContract } from "ethers-multicall";
import erc20 from "@studydefi/money-legos/erc20";

export interface JarWithTVL extends JarWithAPY {
  tvlUSD: null | number;
  usdPerPToken: null | number;
  ratio: null | number;
}

type Input = Array<JarWithAPY> | null;
type Output = {
  jarsWithTVL: Array<JarWithTVL> | null;
};

const isMStonksJar = (token: string) =>
  token === PICKLE_JARS.pUNIMTSLAUST.toLowerCase() ||
  token === PICKLE_JARS.pUNIMBABAUST.toLowerCase() ||
  token === PICKLE_JARS.pUNIMSLVUST.toLowerCase() ||
  token === PICKLE_JARS.pUNIMQQQUST.toLowerCase() ||
  token === PICKLE_JARS.pUNIMAAPLUST.toLowerCase();

const isUniPool = (jarName: string): boolean => {
  return (
    jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_OKT_CHE ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_USDT_CHE ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_BTCK_USDT ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_ETHK_USDT ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_OKT_USDT ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_USDT_USDC
  );
};

export const useJarWithTVL = (jars: Input): Output => {
  const { uniswapv2Pair } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { multicallProvider, signer, chainName } = Connection.useContainer();
  const { poolData } = PoolData.useContainer();
  const [jarsWithTVL, setJarsWithTVL] = useState<Array<JarWithTVL> | null>(
    null,
  );

  const measureUniJarTVL = async (jar: JarWithAPY): Promise<JarWithTVL> => {
    if (!uniswapv2Pair || !prices || !multicallProvider) {
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };
    }

    const uniPairMC = new MulticallContract(
      jar.depositToken.address,
      uniswapv2Pair.interface.fragments,
    );

    const [totalUNI, token0, token1] = await multicallProvider.all([
      uniPairMC.totalSupply(),
      uniPairMC.token0(),
      uniPairMC.token1(),
    ]);

    const Token0 = uniswapv2Pair.attach(token0);
    const Token1 = uniswapv2Pair.attach(token1);

    const [
      supply,
      balance,
      ratio,
      token0InPool,
      token1InPool,
      token0Decimal,
      token1Decimal,
    ] = await Promise.all([
      jar.contract.totalSupply().catch(() => ethers.BigNumber.from(0)),
      jar.contract.balance().catch(() => ethers.BigNumber.from(0)),
      jar.contract.getRatio().catch(() => ethers.utils.parseEther("1")),
      Token0.balanceOf(jar.depositToken.address),
      Token1.balanceOf(jar.depositToken.address),
      Token0.decimals(),
      Token1.decimals(),
    ]);

    const [] = await Promise.all([]);
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

  const measureTVL = async () => {
    if (jars && poolData) {
      let newJars: JarWithTVL[] = jars.map((jar) => {
        const poolInfo = poolData.filter(
          (pool) =>
            pool.tokenAddress.toLowerCase() ===
            jar.depositToken.address.toLowerCase(),
        );
        const tvlUSD =
          poolInfo[0]?.liquidity_locked *
          (isMStonksJar(jar.contract.address.toLowerCase()) ? 2 : 1);
        return {
          ...jar,
          tvlUSD,
          usdPerPToken: (tvlUSD * poolInfo[0]?.ratio) / poolInfo[0]?.tokens,
          ratio: poolInfo[0]?.ratio,
        };
      });

      if (chainName === NETWORK_NAMES.OKEX) {
        const promises: Array<Promise<JarWithTVL>> = jars.map(async (jar) => {
          if (isUniPool(jar.jarName)) return measureUniJarTVL(jar);
        });
        const okexJars = await Promise.all(promises);
        newJars = okexJars;
      }
      setJarsWithTVL(newJars);
    }
  };

  useEffect(() => {
    measureTVL();
  }, [jars, poolData?.length]);

  return {
    jarsWithTVL,
  } as Output;
};
