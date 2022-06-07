import { useState, useEffect } from "react";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { Contract as MulticallContract } from "ethers-multicall";
import { ChainNetwork } from "picklefinance-core";

export interface RawGauge {
  token: string;
  gaugeAddress: string;
  allocPoint: number;
  derivedSupply: number;
  rewardRate: number;
  gaugeWeight: number;
  totalWeight: number;
  totalSupply: number;
}

export const useFetchGauges = (): { rawGauges: Array<RawGauge> | null } => {
  const { blockNum, multicallProvider, chainName } = Connection.useContainer();
  const { gaugeProxy, gauge } = Contracts.useContainer();

  const [gauges, setGauges] = useState<Array<RawGauge> | null>(null);

  const getGauges = async () => {
    if (gaugeProxy && multicallProvider && gauge && chainName === ChainNetwork.Ethereum) {
      const tokens = await gaugeProxy.tokens();
      const totalWeight = await gaugeProxy.totalWeight();

      const mcGaugeProxy = new MulticallContract(gaugeProxy.address, [
        ...gaugeProxy.interface.fragments,
      ]);

      const gaugeAddresses = await multicallProvider.all(
        tokens.map((token) => {
          return mcGaugeProxy.getGauge(token);
        }),
      );

      const gaugeWeights = await multicallProvider.all(
        tokens.map((token) => {
          return mcGaugeProxy.weights(token);
        }),
      );

      const gaugeRewardRates = await multicallProvider.all(
        tokens.map((token, index) => {
          return new MulticallContract(gaugeAddresses[index], [
            ...gauge.interface.fragments,
          ]).rewardRate();
        }),
      );

      const derivedSupplies = await multicallProvider.all(
        tokens.map((token, index) => {
          return new MulticallContract(gaugeAddresses[index], [
            ...gauge.interface.fragments,
          ]).derivedSupply();
        }),
      );

      const totalSupplies = await multicallProvider.all(
        tokens.map((token, index) => {
          return new MulticallContract(gaugeAddresses[index], [
            ...gauge.interface.fragments,
          ]).totalSupply();
        }),
      );

      // extract response and convert to something we can use
      const gauges = tokens.map((token, idx) => {
        return {
          allocPoint: +gaugeWeights[idx].toString() / +totalWeight.toString() || 0,
          token: token,
          gaugeAddress: gaugeAddresses[idx],
          gaugeWeight: +gaugeWeights[idx].toString(),
          totalWeight: +totalWeight.toString(),
          rewardRate: +gaugeRewardRates[idx].toString(),
          derivedSupply: +derivedSupplies[idx].toString(),
          totalSupply: +totalSupplies[idx].toString(),
        };
      });
      setGauges(gauges);
    }
  };

  useEffect(() => {
    getGauges();
  }, [gaugeProxy, multicallProvider, blockNum]);

  return { rawGauges: gauges };
};
