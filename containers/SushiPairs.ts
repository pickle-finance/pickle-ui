import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";

import { PriceIds, Prices } from "./Prices";
import { Connection } from "./Connection";

import { Contract as MulticallContract } from "ethers-multicall";

const addresses = {
  pickle: "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  susd: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
  wbtc: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  yfi: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
  mic: "0x368b3a58b5f49392e5c9e4c998cb0bb966752e51",
  mis: "0x4b4d2e899658fb59b1d518b68fe836b100ee8958",
  yvecrv: "0xc5bDdf9843308380375a611c18B50Fb9341f502A",
  sushi: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
  yvboost: "0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a",
};

interface Token {
  address: string;
  priceId: PriceIds;
  decimals: number;
}

// prettier-ignore
// const pickle: Token = { address: addresses.pickle, priceId: "pickle", decimals: 18 };
const weth: Token = { address: addresses.weth, priceId: "eth", decimals: 18 };
const dai: Token = { address: addresses.dai, priceId: "dai", decimals: 18 };
const usdc: Token = { address: addresses.usdc, priceId: "usdc", decimals: 6 };
const usdt: Token = { address: addresses.usdt, priceId: "usdt", decimals: 6 };
const yfi: Token = { address: addresses.yfi, priceId: "yfi", decimals: 18 };
const wbtc: Token = { address: addresses.wbtc, priceId: "wbtc", decimals: 8 };
const mic: Token = { address: addresses.mic, priceId: "mic", decimals: 18 };
const mis: Token = { address: addresses.mis, priceId: "mis", decimals: 18 };
const yvecrv: Token = {
  address: addresses.yvecrv,
  priceId: "yvecrv",
  decimals: 18,
};
const sushi: Token = {
  address: addresses.sushi,
  priceId: "sushi",
  decimals: 18,
};
const yvboost: Token = {
  address: addresses.yvboost,
  priceId: "yvboost",
  decimals: 18,
};

interface PairMap {
  [key: string]: { a: Token; b: Token };
}

export const PAIR_INFO: PairMap = {
  "0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f": { a: dai, b: weth },
  "0x397FF1542f962076d0BFE58eA045FfA2d347ACa0": { a: usdc, b: weth },
  "0x06da0fd433C1A5d7a4faa01111c044910A184553": { a: usdt, b: weth },
  "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58": { a: wbtc, b: weth },
  "0x088ee5007C98a9677165D78dD2109AE4a3D04d0C": { a: yfi, b: weth },
  "0xC9cB53B48A2f3A9e75982685644c1870F1405CCb": { a: mic, b: usdt },
  "0x066F3A3B7C8Fa077c71B9184d862ed0A4D5cF3e0": { a: mis, b: usdt },
  "0x10B47177E92Ef9D5C6059055d92DdF6290848991": { a: weth, b: yvecrv },
  "0x795065dCc9f64b5614C407a6EFDC400DA6221FB0": { a: sushi, b: weth },
  "0x9461173740D27311b176476FA27e94C681b1Ea6b": { a: weth, b: yvboost },
};

function useSushiPairs() {
  const { multicallProvider } = Connection.useContainer();
  const { prices } = Prices.useContainer();

  // don't return a function if it's not ready to be used
  if (!multicallProvider || !prices)
    return { getPairData: null, getPairDataPrefill: null };

  const getPairData = async (pairAddress: string) => {
    // setup contracts
    const { a, b } = PAIR_INFO[pairAddress];
    const tokenA = new MulticallContract(a.address, erc20.abi);
    const tokenB = new MulticallContract(b.address, erc20.abi);
    const pair = new MulticallContract(pairAddress, erc20.abi);

    const [
      numAInPairBN,
      numBInPairBN,
      totalSupplyBN,
    ] = await multicallProvider?.all([
      tokenA.balanceOf(pairAddress),
      tokenB.balanceOf(pairAddress),
      pair.totalSupply(),
    ]);

    // get num of tokens
    const numAInPair = numAInPairBN / Math.pow(10, a.decimals);
    const numBInPair = numBInPairBN / Math.pow(10, b.decimals);

    // get prices
    const priceA = prices[a.priceId];
    const priceB = prices[b.priceId];

    let totalValueOfPair;
    // In case price one token is not listed on coingecko
    if (priceA) {
      totalValueOfPair = 2 * priceA * numAInPair;
    } else {
      totalValueOfPair = 2 * priceB * numBInPair;
    }

    const totalSupply = totalSupplyBN / 1e18; // Uniswap LP tokens are always 18 decimals
    const pricePerToken = totalValueOfPair / totalSupply;

    return { totalValueOfPair, totalSupply, pricePerToken };
  };

  // Mainly for multi-call
  const getPairDataPrefill = (
    pairAddress: string,
    numAInPairBN: ethers.BigNumber,
    numBInPairBN: ethers.BigNumber,
    totalSupplyBN: ethers.BigNumber,
  ) => {
    const { a, b } = PAIR_INFO[pairAddress];

    // get num of tokens
    const numAInPair = parseFloat(
      ethers.utils.formatUnits(numAInPairBN, a.decimals),
    );
    const numBInPair = parseFloat(
      ethers.utils.formatUnits(numBInPairBN, b.decimals),
    );

    // get prices
    const priceA = prices[a.priceId];
    const priceB = prices[b.priceId];

    const totalValueOfPair = priceA * numAInPair + priceB * numBInPair;
    const totalSupply = parseFloat(ethers.utils.formatEther(totalSupplyBN)); // Uniswap LP tokens are always 18 decimals
    const pricePerToken = totalValueOfPair / totalSupply;

    return { totalValueOfPair, totalSupply, pricePerToken };
  };

  return { getPairData, getPairDataPrefill };
}

export const SushiPairs = createContainer(useSushiPairs);
