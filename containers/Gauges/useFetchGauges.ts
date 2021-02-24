import { useState, useEffect } from "react";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";

import { Contract as MulticallContract } from "ethers-multicall";

export interface RawGauge {
  token: string;
  gaugeAddress: string;
  allocPoint: number;
}

export const useFetchGauges = (): { rawGauges: Array<RawGauge> | null } => {
  const { blockNum, multicallProvider } = Connection.useContainer();
  const { gaugeProxy } = Contracts.useContainer();

  const [gauges, setGauges] = useState<Array<RawGauge> | null>(null);

  const getGauges = async () => {
    if (gaugeProxy && multicallProvider) {
      console.log("gaugeProxy", gaugeProxy);
      const tokens = await gaugeProxy.tokens();
      console.log("tokens", tokens);
      const totalWeight = await gaugeProxy.totalWeight();
      console.log("totalWeight", totalWeight);

      const mcGaugeProxy = new MulticallContract(
        gaugeProxy.address,
        gaugeProxy.interface.fragments,
      );

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

      console.log("gaugeWeights", gaugeWeights);

      // extract response and convert to something we can use
      const gauges = tokens.map((token, idx) => {
        return {
          allocPoint:
            +gaugeWeights[idx].toString() / +totalWeight.toString() || 0,
          token: token,
          gaugeAddress: gaugeAddresses[idx],
        };
      });

      console.log("gauges", gauges);
      setGauges(gauges);
    }
  };

  useEffect(() => {
    getGauges();
  }, [blockNum]);

  return { rawGauges: gauges };
};
