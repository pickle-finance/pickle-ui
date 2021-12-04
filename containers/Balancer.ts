import { createContainer } from "unstated-next";
import { differenceInWeeks } from "date-fns";
import { Prices, PriceIds } from "containers/Prices";
import { Connection } from "./Connection";
import { Contract, ethers } from "ethers";
import balVaultABI from "./ABIs/balancer_vault.json";
import erc20 from "@studydefi/money-legos/erc20";
// import fetch from "node-fetch";
import { useState } from "react";

const balLMUrl =
  "https://raw.githubusercontent.com/balancer-labs/frontend-v2/master/src/lib/utils/liquidityMining/MultiTokenLiquidityMining.json";
const balVaultAddr = "0xba12222222228d8ba445958a75a0704d566bf2c8";

// Balancer stuff
function toUtcTime(date: Date) {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
}

// Liquidity mining started on June 1, 2020 00:00 UTC
const liquidityMiningStartTime = Date.UTC(2020, 5, 1, 0, 0);

function getCurrentLiquidityMiningWeek() {
  return differenceInWeeks(toUtcTime(new Date()), liquidityMiningStartTime) + 1;
}

function getWeek(miningWeek: number) {
  return `week_${miningWeek}`;
}

type LiquidityMiningPools = Record<
  string,
  { tokenAddress: string; amount: number }[]
>;

type LiquidityMiningWeek = Array<{
  chainId: number;
  pools: LiquidityMiningPools;
}>;

const addresses = {
  bal: "0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8",
  weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  pickle: "0x965772e0e9c84b6f359c8597c891108dcf1c5b1a",
  usdc: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
  wbtc: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
};

interface Token {
  address: string;
  priceId: PriceIds;
  decimals: number;
}

// prettier-ignore
const pickle: Token = {
  address: addresses.pickle,
  priceId: "pickle",
  decimals: 18,
};
const aeth: Token = { address: addresses.weth, priceId: "eth", decimals: 18 };
const bal: Token = { address: addresses.bal, priceId: "bal", decimals: 18 };
const usdc: Token = { address: addresses.usdc, priceId: "usdc", decimals: 6 };
const wbtc: Token = { address: addresses.wbtc, priceId: "wbtc", decimals: 8 };

interface PoolMap {
  [key: string]: { a: Token; b: Token; c?: Token };
}
export const BALANCER_POOLS_INFO: PoolMap = {
  "0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac": { a: pickle, b: aeth },
  "0x64541216bafffeec8ea535bb71fbc927831d0595": { a: aeth, b: wbtc, c: usdc },
};

const balPoolIds: { [poolTokenAddress: string]: string } = {
  "0x64541216bafffeec8ea535bb71fbc927831d0595":
    "0x64541216bafffeec8ea535bb71fbc927831d0595000100000000000000000002", // bal tricrypto
  "0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac":
    "0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac000200000000000000000017", // bal pickle-eth
};

interface Tokens {
  [tokenAddres: string]: {
    // id: string;
    decimals: number;
    // price: number;
    priceId: PriceIds;
  };
}

const TOKENS: Tokens = {
  "0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8": {
    decimals: 18,
    priceId: "bal",
  },
  "0x965772e0e9c84b6f359c8597c891108dcf1c5b1a": {
    decimals: 18,
    priceId: "pickle",
  },
  "0x82af49447d8a07e3bd95bd0d56f35241523fbab1": {
    decimals: 18,
    priceId: "eth",
  },
  "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8": {
    priceId: "usdc",
    decimals: 6,
  },
  "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f": {
    priceId: "wbtc",
    decimals: 8,
  },
};

function useBalancerPools() {
  const {
    multicallProvider,
    provider,
    chainId,
    blockNum,
  } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  interface GraphResponse {
    address: string;
    totalLiquidity: number;
    totalSwapFee: number;
  }

  if (!prices || !provider || !multicallProvider) {
    return { calculateBalJarAPYs: null };
  }

  const queryTheGraph = async (poolAddress: string, blockNumber: number) => {
    const res = await fetch(
      "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2",
      {
        credentials: "omit",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/json",
        },
        referrer:
          "https://thegraph.com/hosted-service/subgraph/balancer-labs/balancer-arbitrum-v2",
        body: `{"query":"{\\n  pools(first: 1, skip: 0, block: {number: ${blockNumber}}, where: {address_in: [\\"${poolAddress}\\"]}) {\\n    address\\n    totalLiquidity\\n    totalSwapFee\\n  }\\n}\\n","variables":null}`,
        method: "POST",
        mode: "cors",
      },
    ).then((x) => x.json());
    const poolData = res?.data?.pools[0];
    if (poolData) {
      return {
        address: <string>poolData.address,
        totalLiquidity: +poolData.totalLiquidity,
        totalSwapFee: +poolData.totalSwapFee,
      } as GraphResponse;
    }
    return {}
  };

  const getBalancerPoolDayAPY = async (poolAddress: string) => {
    const arbBlocktime = 3;
    const secondsInDay = 60 * 60 * 24;
    const blocksInDay = Math.round(secondsInDay / arbBlocktime);
    const currentPoolDayDate = await queryTheGraph(poolAddress, blockNum!);
    const yesterdayPoolDayData = await queryTheGraph(
      poolAddress,
      blockNum! - blocksInDay,
    );
    const lastDaySwapFee =
      currentPoolDayDate.totalSwapFee - yesterdayPoolDayData.totalSwapFee;
    const apy =
      (lastDaySwapFee / currentPoolDayDate.totalLiquidity) * 365 * 100;

    return { lp: apy };
  };

  const getPoolData = async (poolAddress: string) => {
    const balVaultContract = new Contract(balVaultAddr, balVaultABI, provider);
    const poolTokensResp = await balVaultContract.callStatic["getPoolTokens"](
      balPoolIds[poolAddress.toLowerCase()],
    );
    const { tokens, balances } = poolTokensResp;
    const filtered = tokens.map((tokenAddr: string, i: number) => {
      return [
        tokenAddr,
        parseFloat(
          ethers.utils.formatUnits(
            balances[i],
            TOKENS[tokenAddr.toLowerCase()].decimals,
          ),
        ),
      ];
    });
    const poolContract = new Contract(poolAddress, erc20.abi, provider);
    const poolTokenTotalSupply = (await poolContract.totalSupply()) * 1e18;
    const poolTotalBalanceUSD = filtered.reduce(
      (total: number, token: [string, number]) => {
        const tokenPriceId = TOKENS[token[0].toLowerCase()].priceId;
        const tokenValueUSD = token[1] * prices![tokenPriceId];
        return total + tokenValueUSD;
      },
      0,
    );
    return {
      totalPoolValue: poolTotalBalanceUSD,
      totalSupply: poolTokenTotalSupply,
      pricePerToken: poolTotalBalanceUSD / poolTokenTotalSupply,
    };
  };

  const calculateBalPoolAPRs = async (depositToken: string) => {
    const weeksLMResp = await fetch(balLMUrl);
    const weeksLMData = await weeksLMResp.json();
    const miningWeek = getCurrentLiquidityMiningWeek();
    let currentWeekData = weeksLMData[getWeek(miningWeek)] as LiquidityMiningWeek;
    let n = 1;
    while (!currentWeekData && miningWeek - n >= 1) {
      // balLMUrl can take some time to include current week rewards
      currentWeekData = weeksLMData[
        getWeek(miningWeek - n)
      ] as LiquidityMiningWeek;
      n++;
    }
    if (!currentWeekData) return [];
    const miningRewards: LiquidityMiningPools = {};
    if (currentWeekData) {
      Object.assign(
        miningRewards,
        currentWeekData.find((pool) => pool.chainId === 42161)?.pools,
      );
    }

    const { totalPoolValue } = await getPoolData(depositToken);

    const poolRewardsPerWeek =
      miningRewards[balPoolIds[depositToken.toLowerCase()]];
    const poolRewardsPerWeekExtended = poolRewardsPerWeek.map((reward) => {
      const rewardValue =
        reward.amount * prices![TOKENS[reward.tokenAddress].priceId];
      const id = TOKENS[reward.tokenAddress].priceId;
      const apr = ((rewardValue / 7) * 365) / totalPoolValue;
      return { ...reward, usd: rewardValue, id: id, apr: apr };
    });

    const aprComponents = poolRewardsPerWeekExtended.map((reward) => {
      return {
        [reward.id]: reward.apr * 100,
      };
    });

    const lpRes = await getBalancerPoolDayAPY(depositToken);
    const lp = lpRes.lp ? lpRes: {lp: 0};
    let poolTotalAPR = poolRewardsPerWeekExtended.reduce(
      (sum, a) => sum + a.apr,
      0,
    );
    
    let poolCompoundingAPY = 100 * (Math.pow(1 + poolTotalAPR / 365, 365) - 1);

    let poolTotalAPRFixed = poolRewardsPerWeekExtended.reduce(
      (sum, a) => sum + a.apr * 100,
      0,
    );
    aprComponents.push(lp);

    if (lp) {
      poolTotalAPRFixed += lp.lp;
      poolCompoundingAPY += lp.lp;
    }

    return {
      APYs: aprComponents,
      apr: poolTotalAPRFixed,
      totalAPY: poolCompoundingAPY,
      lp: lp ? lp.lp : 0,
    };
  };

  return { calculateBalPoolAPRs };
}

export const BalancerPool = createContainer(useBalancerPools);
