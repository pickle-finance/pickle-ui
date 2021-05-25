import { createContainer } from "unstated-next";
import { ethers, Contract } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";

import { PriceIds, Prices } from "./Prices";
import { Connection } from "./Connection";

const addresses = {
  usdc: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  weth: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  must: "0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f",
};

interface Token {
  address: string;
  priceId: PriceIds;
  decimals: number;
}

// prettier-ignore
// const must: Token = { address: addresses.must, priceId: "pickle", decimals: 18 };
const weth: Token = { address: addresses.weth, priceId: "eth", decimals: 18 };
const usdc: Token = { address: addresses.usdc, priceId: "usdc", decimals: 6 };

interface PairMap {
  [key: string]: { a: Token; b: Token };
}

export const PAIR_INFO: PairMap = {
  "0x1Edb2D8f791D2a51D56979bf3A25673D6E783232": { a: usdc, b: weth },
};

function useComethPairs() {
  const {
    multicallProvider,
  } = Connection.useContainer();
  const { prices } = Prices.useContainer();

  // don't return a function if it's not ready to be used
  if (!multicallProvider || !prices)
    return { getPairData: null, getPairDataPrefill: null };

  const getPairData = async (pairAddress: string) => {
    // setup contracts
    const { a, b } = PAIR_INFO[pairAddress];
    const tokenA = new Contract(a.address, erc20.abi, multicallProvider);
    const tokenB = new Contract(b.address, erc20.abi, multicallProvider);
    const pair = new Contract(pairAddress, erc20.abi, multicallProvider);

    const [numAInPairBN, numBInPairBN, totalSupplyBN] = await Promise.all([
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

    const totalValueOfPair = priceA * numAInPair + priceB * numBInPair;
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

export const ComethPairs = createContainer(useComethPairs);
