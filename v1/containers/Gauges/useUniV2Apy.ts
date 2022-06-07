import { useState, useEffect } from "react";
import erc20 from "@studydefi/money-legos/erc20";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { Prices } from "../Prices";

import { UniV2Pairs, PAIR_INFO } from "../UniV2Pairs";
import { PAIR_INFO as uniV2PairMap } from "../UniV2Pairs";
import { GaugeWithReward } from "./useWithReward";

import { ethers } from "ethers";
import { Contract as MulticallContract } from "ethers-multicall";

const { formatEther } = ethers.utils;

export interface GaugeWithApy extends GaugeWithReward {
  fullApy: number;
  usdPerToken: number;
  totalValue: number;
  valueStakedInGauge: number;
  numTokensInPool: number;
}

// what comes in and goes out of this function
type Input = GaugeWithReward[] | null;
type Output = { uniV2GaugesWithApy: GaugeWithApy[] | null };

export const useUniV2Apy = (inputGauges: Input): Output => {
  const [gauges, setGauges] = useState<GaugeWithApy[] | null>(null);

  const { multicallProvider, provider } = Connection.useContainer();
  const { masterchef } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { getPairDataPrefill } = UniV2Pairs.useContainer();

  const calculateApy = async () => {
    if (
      provider &&
      inputGauges &&
      prices &&
      masterchef &&
      getPairDataPrefill &&
      multicallProvider
    ) {
      // filter for only uniswap v2 gauges
      const uniV2Gauges = inputGauges?.filter((gauge) => uniV2PairMap[gauge.token]);

      // Batch-call
      const prefilledDatas = uniV2Gauges
        .map((gauge) => {
          const { a, b } = PAIR_INFO[gauge.token];
          const tokenA = new MulticallContract(a.address, erc20.abi);
          const tokenB = new MulticallContract(b.address, erc20.abi);
          const pair = new MulticallContract(gauge.token, erc20.abi);
          return [
            tokenA.balanceOf(gauge.token),
            tokenB.balanceOf(gauge.token),
            pair.totalSupply(),
            pair.balanceOf(masterchef.address),
          ];
        })
        .reduce((acc, x) => {
          return [...acc, ...x];
        }, []);

      const datas = await multicallProvider.all(prefilledDatas);

      const promises = uniV2Gauges.map((gauge, idx) => {
        const numAInPairBN = datas[idx * 4];
        const numBInPair = datas[idx * 4 + 1];
        const totalSupplyBN = datas[idx * 4 + 2];
        const masterchefPairSupply = datas[idx * 4 + 3];

        const { totalValueOfPair, pricePerToken } = getPairDataPrefill(
          gauge.token,
          numAInPairBN,
          numBInPair,
          totalSupplyBN,
        );

        // get total num of tokens staked in gaugeing pool
        const numTokensInPool = parseFloat(formatEther(masterchefPairSupply));

        // calculate APY
        const valueStakedInGauge = pricePerToken * numTokensInPool;
        const fullApy = (gauge.rewardRatePerYear * prices.pickle) / pricePerToken;

        return {
          ...gauge,
          fullApy,
          usdPerToken: pricePerToken,
          totalValue: totalValueOfPair,
          valueStakedInGauge,
          numTokensInPool,
        };
      });

      const res = await Promise.all(promises);
      setGauges(res);
    }
  };

  useEffect(() => {
    calculateApy();
  }, [inputGauges]);

  return { uniV2GaugesWithApy: gauges };
};
