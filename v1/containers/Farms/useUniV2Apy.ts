import { useState, useEffect } from "react";
import erc20 from "@studydefi/money-legos/erc20";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { Prices } from "../Prices";

import { UniV2Pairs, PAIR_INFO } from "../UniV2Pairs";
import { PAIR_INFO as uniV2PairMap } from "../UniV2Pairs";
import { FarmWithReward } from "./useWithReward";
import { Contract as MulticallContract } from "ethers-multicall";

import { Contract, ethers } from "ethers";

const { formatEther } = ethers.utils;

export interface FarmWithApy extends FarmWithReward {
  apy: number;
  usdPerToken: number;
  totalValue: number;
  valueStakedInFarm: number;
  numTokensInPool: number;
}

// what comes in and goes out of this function
type Input = FarmWithReward[] | null;
type Output = { uniV2FarmsWithApy: FarmWithApy[] | null };

export const useUniV2Apy = (inputFarms: Input): Output => {
  const [farms, setFarms] = useState<FarmWithApy[] | null>(null);

  const { multicallProvider } = Connection.useContainer();
  const { masterchef } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { getPairDataPrefill } = UniV2Pairs.useContainer();

  const calculateApy = async () => {
    if (inputFarms && prices && masterchef && getPairDataPrefill && multicallProvider) {
      // filter for only uniswap v2 farms
      const uniV2Farms = inputFarms?.filter((farm) => uniV2PairMap[farm.lpToken]);

      // Batch-call
      const prefilledDatas = uniV2Farms
        .map((farm) => {
          const { a, b } = PAIR_INFO[farm.lpToken];
          const tokenA = new MulticallContract(a.address, erc20.abi);
          const tokenB = new MulticallContract(b.address, erc20.abi);
          const pair = new MulticallContract(farm.lpToken, erc20.abi);
          return [
            tokenA.balanceOf(farm.lpToken),
            tokenB.balanceOf(farm.lpToken),
            pair.totalSupply(),
            pair.balanceOf(masterchef.address),
          ];
        })
        .reduce((acc, x) => {
          return [...acc, ...x];
        }, []);

      const datas = await multicallProvider.all(prefilledDatas);

      const promises = uniV2Farms.map((farm, idx) => {
        const numAInPairBN = datas[idx * 4];
        const numBInPair = datas[idx * 4 + 1];
        const totalSupplyBN = datas[idx * 4 + 2];
        const masterchefPairSupply = datas[idx * 4 + 3];

        const { totalValueOfPair, pricePerToken } = getPairDataPrefill(
          farm.lpToken,
          numAInPairBN,
          numBInPair,
          totalSupplyBN,
        );

        // get total num of tokens staked in farming pool
        const numTokensInPool = parseFloat(formatEther(masterchefPairSupply));

        // calculate APY
        const valueStakedInFarm = pricePerToken * numTokensInPool;
        const apy = farm.valueRewarded.perYear / valueStakedInFarm;
        return {
          ...farm,
          apy,
          usdPerToken: pricePerToken,
          totalValue: totalValueOfPair,
          valueStakedInFarm,
          numTokensInPool,
        };
      });

      const res = await Promise.all(promises);
      setFarms(res);
    }
  };

  useEffect(() => {
    calculateApy();
  }, [inputFarms]);

  return { uniV2FarmsWithApy: farms };
};
