import { createContainer } from "unstated-next";
import erc20 from "@studydefi/money-legos/erc20";
import Three_pool_abi from "./ABIs/three_pool.json";
import { THREE_POOL_ADDR } from "./Contracts";

import { PriceIds, Prices } from "./Prices";
import { Connection } from "./Connection";

import { Contract as MulticallContract } from "ethers-multicall";

interface PairMap {
  [key: string]: { a: Token; b: Token };
}

interface Token {
  address: string;
  priceId?: PriceIds;
  decimals: number;
}

const addresses = {
  alusd: "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9",
  three_crv: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
};

const alusd: Token = {
  address: addresses.alusd,
  priceId: "alusd",
  decimals: 18,
};

const three_crv: Token = {
  address: addresses.three_crv,
  decimals: 18,
};

export const PAIR_INFO: PairMap = {
  "0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c": { a: alusd, b: three_crv },
};

function useCurvePairs() {
  const { multicallProvider } = Connection.useContainer();
  const { prices } = Prices.useContainer();

  // don't return a function if it's not ready to be used
  if (!multicallProvider || !prices) return { getAlusd3CrvData: null };

  const getAlusd3CrvData = async (pairAddress: string) => {
    // setup contracts
    const { a, b } = PAIR_INFO[pairAddress];
    const tokenA = new MulticallContract(a.address, erc20.abi);
    const tokenB = new MulticallContract(b.address, erc20.abi);
    const pair = new MulticallContract(pairAddress, erc20.abi);
    const three_pool = new MulticallContract(THREE_POOL_ADDR, Three_pool_abi);
    console.log("three_pool => ", three_pool);

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
    const priceB = three_pool.get_virtual_price() / 1e18;

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

  return { getAlusd3CrvData };
}

export const CurvePairs = createContainer(useCurvePairs);
