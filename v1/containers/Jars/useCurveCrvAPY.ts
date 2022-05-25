import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";

import { Connection } from "../Connection";
import { Prices } from "../Prices";
import { Contracts } from "../Contracts";
import { Jar } from "./useFetchJars";

import { Pool } from "../Contracts/Pool";

import { CurveGauge } from "../Contracts/CurveGauge";
import { Contract as MulticallContract } from "ethers-multicall";
import { ChainNetwork } from "picklefinance-core";

export interface JarApy {
  [k: string]: number;
}

export interface JarWithAPY extends Jar {
  totalAPY: number;
  APYs: Array<JarApy>;
}

type Input = Array<Jar> | null;
type Output = {
  APYs: Array<{ [key: string]: number }>;
};

const getCompoundingAPY = (apr: number) => {
  return 100 * (Math.pow(1 + apr / 365, 365) - 1);
};

export const useCurveCrvAPY = (
  jars: Input,
  underlyingPrice: number | null,
  gauge: CurveGauge | null,
  pool: Pool | null,
): Output => {
  const { prices } = Prices.useContainer();
  const { gaugeController } = Contracts.useContainer();
  const { multicallProvider, chainName } = Connection.useContainer();

  const [CRVAPY, setCRVAPY] = useState<number | null>(null);

  const getCRVAPY = async () => {
    if (gaugeController && gauge && pool && underlyingPrice && prices?.crv && multicallProvider) {
      const mcGauge = new MulticallContract(gauge.address, gauge.interface.fragments);

      const mcPool = new MulticallContract(pool.address, pool.interface.fragments);

      const weight = await gaugeController["gauge_relative_weight(address)"](
        gauge.address,
      ).then((x) => parseFloat(ethers.utils.formatUnits(x)));

      const [workingSupply, gaugeRate, virtualPrice] = (
        await multicallProvider.all([
          mcGauge.working_supply(),
          mcGauge.inflation_rate(),
          mcPool.get_virtual_price(),
        ])
      ).map((x) => parseFloat(ethers.utils.formatUnits(x)));

      // https://github.com/curvefi/curve-dao/blob/b7d6d2b6633fd64aa44e80094f6fb5f17f5e771a/src/components/minter/gaugeStore.js#L212
      const rate =
        (((gaugeRate * weight * 31536000) / workingSupply) * 0.4) /
        (virtualPrice * underlyingPrice);

      const crvApy = rate * prices?.crv * 100;
      setCRVAPY(crvApy * 0.725);
    }
  };

  useEffect(() => {
    if (chainName === ChainNetwork.Ethereum) getCRVAPY();
  }, [jars, prices]);

  return {
    APYs: [{ crv: getCompoundingAPY((CRVAPY || 0) / 100), apr: CRVAPY || 0 }],
  };
};
