import { useEffect, useState } from "react";

import { JarWithAPY } from "./useJarsWithAPYEth";
import { DEPOSIT_TOKENS_NAME, JAR_DEPOSIT_TOKENS, PICKLE_JARS } from "./jars";
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
import { CurvePairs } from "containers/CurvePairs";
import { tricryptoInfo } from "./useJarsWithAPYArb";

export interface JarWithTVL extends JarWithAPY {
  tvlUSD: null | number;
  usdPerPToken: null | number;
  ratio: null | number;
}

type Input = Array<JarWithAPY> | null;
type Output = {
  jarsWithTVL: Array<JarWithTVL> | null;
};

const pool_abi = ["function get_virtual_price() view returns(uint256)"];
const swap_abi = ["function balances(uint256) view returns(uint256)"];

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
    jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_ETHK_USDT ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.CHERRY_OKT_USDT ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.JSWAP_JF_USDT ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.JSWAP_BTCK_USDT ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.JSWAP_ETHK_USDT ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_MIM_ETH ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.SUSHI_SPELL_ETH ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.DODO_HND_ETH
  );
};

const isCurvePool = (jarName: string): boolean => {
  return (
    jarName === DEPOSIT_TOKENS_JAR_NAMES.MIM_2CRV ||
    jarName === DEPOSIT_TOKENS_JAR_NAMES.CRV_TRICRYPTO
  );
};

export const useJarWithTVL = (jars: Input): Output => {
  const { uniswapv2Pair, dodoPair } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { multicallProvider, signer, chainName } = Connection.useContainer();
  const { poolData } = PoolData.useContainer();
  const { getCurveLpPriceData } = CurvePairs.useContainer();
  const [jarsWithTVL, setJarsWithTVL] = useState<Array<JarWithTVL> | null>(
    null,
  );

  const measureCurveTVL = async (jar: JarWithAPY) => {
    if (!multicallProvider || !getCurveLpPriceData || !prices) {
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };
    }

    const multicallJarContract = new MulticallContract(
      jar.contract.address,
      jar.contract.interface.fragments,
    );

    const [supply, balance, ratio] = (
      await multicallProvider.all([
        multicallJarContract.totalSupply(),
        multicallJarContract.balance(),
        multicallJarContract.getRatio(),
      ])
    ).map((x) => parseFloat(formatEther(x)));

    let virtualPrice = 1;
    let pricePerUnderlying = 1;
    if (jar.depositToken.address === JAR_DEPOSIT_TOKENS.Arbitrum.MIM_2CRV) {
      virtualPrice = await getCurveLpPriceData(jar.depositToken.address);
    } else if (
      jar.depositToken.address === JAR_DEPOSIT_TOKENS.Arbitrum.CRV_TRICRYPTO
    ) {
      const swapAddress = "0x960ea3e3C7FB317332d990873d354E18d7645590";
      const pool = new ethers.Contract(swapAddress, pool_abi, signer); // Tricrypto pool - replace when more pools are added
      virtualPrice = parseFloat(formatEther(await pool.get_virtual_price()));

      const supply = await jar.depositToken["totalSupply()"]();

      const swap = new MulticallContract(swapAddress, swap_abi);
      const [balance0, balance1, balance2] = await multicallProvider.all([
        swap.balances(0),
        swap.balances(1),
        swap.balances(2),
      ]);
      const tokenInfo = tricryptoInfo.tokenInfo;
      const scaledBalance0 =
        (balance0 / tokenInfo.decimals[0]) * prices[tokenInfo.tokens[0]];
      const scaledBalance1 =
        (balance1 / tokenInfo.decimals[1]) * prices[tokenInfo.tokens[1]];
      const scaledBalance2 =
        (balance2 / tokenInfo.decimals[2]) * prices[tokenInfo.tokens[2]];
      const totalStakedUsd = scaledBalance0 + scaledBalance1 + scaledBalance2;
      pricePerUnderlying = totalStakedUsd / +formatEther(supply);
    }

    const tvlUSD = balance * virtualPrice * pricePerUnderlying;

    const usdPerPToken = tvlUSD / supply;

    return { ...jar, tvlUSD, usdPerPToken, ratio };
  };

  const measureUniJarTVL = async (jar: JarWithAPY): Promise<JarWithTVL> => {
    if (!uniswapv2Pair || !prices || !multicallProvider || !dodoPair) {
      return { ...jar, tvlUSD: null, usdPerPToken: null, ratio: null };
    }

    let totalUNI, token0, token1;

    if (jar.depositToken.address === JAR_DEPOSIT_TOKENS.Arbitrum.DODO_HND_ETH) {
      const dodoPairMC = new MulticallContract(
        jar.depositToken.address,
        dodoPair.interface.fragments,
      );

      [totalUNI, token0, token1] = await multicallProvider.all([
        dodoPairMC.totalSupply(),
        dodoPairMC._BASE_TOKEN_(),
        dodoPairMC._QUOTE_TOKEN_(),
      ]);
    } else {
      const uniPairMC = new MulticallContract(
        jar.depositToken.address,
        uniswapv2Pair.interface.fragments,
      );

      [totalUNI, token0, token1] = await multicallProvider.all([
        uniPairMC.totalSupply(),
        uniPairMC.token0(),
        uniPairMC.token1(),
      ]);
    }
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
    
    const tvlUSD =
    token0Bal * prices[token0PriceId] + token1Bal * prices[token1PriceId];
    
    const usdPerPToken = tvlUSD / parseFloat(formatEther(supply));

    return {
      ...jar,
      tvlUSD,
      usdPerPToken,
      ratio: parseFloat(formatEther(ratio)),
    };
  };

  const measureUsdJarTVL = async (jar: JarWithAPY): Promise<JarWithTVL> => {
    const token = new ethers.Contract(
      jar.depositToken.address,
      erc20.abi,
      signer,
    );
    const balance = await token.balanceOf(jar.contract.address);
    const ratio = await jar.contract.getRatio();
    return {
      ...jar,
      tvlUSD: parseFloat(formatEther(balance)),
      usdPerPToken: 1,
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
        const tvlUSD = poolInfo[0]?.liquidity_locked;
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
          if (isCurvePool(jar.jarName)) return measureCurveTVL(jar);
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
