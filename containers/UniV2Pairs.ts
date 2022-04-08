import { createContainer } from "unstated-next";
import { ethers, Contract } from "ethers";
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
  bac: "0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a",
  bas: "0x106538CC16F938776c7c180186975BCA23875287",
  mir: "0x09a3ecafa817268f77be1283176b946c4ff2e608",
  ust: "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
  mtsla: "0x21cA39943E91d704678F5D00b6616650F066fD63",
  maapl: "0xd36932143F6eBDEDD872D5Fb0651f4B72Fd15a84",
  mqqq: "0x13B02c8dE71680e71F0820c996E4bE43c2F57d15",
  mslv: "0x9d1555d8cB3C846Bb4f7D5B1B1080872c3166676",
  mbaba: "0x56aA298a19C93c6801FDde870fA63EF75Cc0aF72",
  fei: "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
  tribe: "0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B",
  lusd: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
  fox: "0xc770eefad204b5180df6a14ee197d99d808ee52d",
  rly: "0xf1f955016ecbcd7321c7266bccfb96c68ea5e49b",
};

interface Token {
  address: string;
  priceId: PriceIds;
  decimals: number;
}

// prettier-ignore
const pickle: Token = { address: addresses.pickle, priceId: "pickle", decimals: 18 };
const weth: Token = { address: addresses.weth, priceId: "eth", decimals: 18 };
const dai: Token = { address: addresses.dai, priceId: "dai", decimals: 18 };
const usdc: Token = { address: addresses.usdc, priceId: "usdc", decimals: 6 };
const usdt: Token = { address: addresses.usdt, priceId: "usdt", decimals: 6 };
const susd: Token = { address: addresses.susd, priceId: "susd", decimals: 18 };
const wbtc: Token = { address: addresses.wbtc, priceId: "wbtc", decimals: 8 };
const bac: Token = { address: addresses.bac, priceId: "bac", decimals: 18 };
const bas: Token = { address: addresses.bas, priceId: "bas", decimals: 18 };
const mir: Token = { address: addresses.mir, priceId: "mir", decimals: 18 };
const ust: Token = { address: addresses.ust, priceId: "ust", decimals: 18 };
const mtsla: Token = {
  address: addresses.mtsla,
  priceId: "mtsla",
  decimals: 18,
};
const maapl: Token = {
  address: addresses.maapl,
  priceId: "maapl",
  decimals: 18,
};
const mqqq: Token = { address: addresses.mqqq, priceId: "mqqq", decimals: 18 };
const mslv: Token = { address: addresses.mslv, priceId: "mslv", decimals: 18 };
const mbaba: Token = {
  address: addresses.mbaba,
  priceId: "mbaba",
  decimals: 18,
};
const fei: Token = { address: addresses.fei, priceId: "fei", decimals: 18 };
const tribe: Token = {
  address: addresses.tribe,
  priceId: "tribe",
  decimals: 18,
};
const lusd: Token = { address: addresses.lusd, priceId: "lusd", decimals: 18 };
const fox: Token = { address: addresses.fox, priceId: "fox", decimals: 18 };
const rly: Token = { address: addresses.rly, priceId: "rly", decimals: 18 };

interface PairMap {
  [key: string]: { a: Token; b: Token };
}

export const PAIR_INFO: PairMap = {
  "0xdc98556Ce24f007A5eF6dC1CE96322d65832A819": { a: pickle, b: weth },
  "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11": { a: dai, b: weth },
  "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc": { a: usdc, b: weth },
  "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852": { a: usdt, b: weth },
  "0xf80758aB42C3B07dA84053Fd88804bCB6BAA4b5c": { a: susd, b: weth },
  "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940": { a: wbtc, b: weth },
  "0xd4405F0704621DBe9d4dEA60E128E0C3b26bddbD": { a: bac, b: dai },
  "0x3E78F2E7daDe07ea685F8612F00477FD97162F1e": { a: bas, b: dai },
  "0x87dA823B6fC8EB8575a235A824690fda94674c88": { a: mir, b: ust },
  "0x5233349957586A8207c52693A959483F9aeAA50C": { a: mtsla, b: ust },
  "0xB022e08aDc8bA2dE6bA4fECb59C6D502f66e953B": { a: maapl, b: ust },
  "0x9E3B47B861B451879d43BBA404c35bdFb99F0a6c": { a: mqqq, b: ust },
  "0x860425bE6ad1345DC7a3e287faCBF32B18bc4fAe": { a: mslv, b: ust },
  "0x676Ce85f66aDB8D7b8323AeEfe17087A3b8CB363": { a: mbaba, b: ust },
  "0x9928e4046d7c6513326cCeA028cD3e7a91c7590A": { a: fei, b: tribe },
  "0xF20EF17b889b437C151eB5bA15A47bFc62bfF469": { a: lusd, b: weth },
  "0x470e8de2eBaef52014A47Cb5E6aF86884947F08c": { a: weth, b: fox },
  "0x27fD0857F0EF224097001E87e61026E39e1B04d1": { a: weth, b: rly },
};

function useUniV2Pairs() {
  const { multicallProvider } = Connection.useContainer();
  const { prices } = Prices.useContainer();

  // don't return a function if it's not ready to be used
  if (!multicallProvider || !prices) return { getPairData: null, getPairDataPrefill: null };

  const getPairData = async (pairAddress: string) => {
    // setup contracts
    const { a, b } = PAIR_INFO[pairAddress];
    const tokenA = new MulticallContract(a.address, erc20.abi);
    const tokenB = new MulticallContract(b.address, erc20.abi);
    const pair = new MulticallContract(pairAddress, erc20.abi);

    const [numAInPairBN, numBInPairBN, totalSupplyBN] = await multicallProvider?.all([
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
    const numAInPair = parseFloat(ethers.utils.formatUnits(numAInPairBN, a.decimals));
    const numBInPair = parseFloat(ethers.utils.formatUnits(numBInPairBN, b.decimals));

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

    const totalSupply = parseFloat(ethers.utils.formatEther(totalSupplyBN)); // Uniswap LP tokens are always 18 decimals
    const pricePerToken = totalValueOfPair / totalSupply;

    return { totalValueOfPair, totalSupply, pricePerToken };
  };

  return { getPairData, getPairDataPrefill };
}

export const UniV2Pairs = createContainer(useUniV2Pairs);
