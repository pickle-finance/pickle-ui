import { BigNumber, Contract, ethers } from "ethers";
import { useState, useEffect } from "react";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { Prices } from "../Prices";

import { JAR_GAUGE_MAP } from "./gauges";
import { GaugeWithApy } from "./useUniV2Apy";
import { GaugeWithReward } from "./useWithReward";
import { Jars } from "../Jars";
import { PICKLE_JARS } from "../../containers/Jars/jars";
import retry from "async-retry";

import mlErc20 from "@studydefi/money-legos/erc20";
import { retryOptions, timeout } from "util/api";

// what comes in and goes out of this function
type Input = GaugeWithReward[] | null;
type Output = { jarGaugeWithApy: GaugeWithApy[] | null };

export const useJarGaugeApy = (inputGauges: Input): Output => {
  const { jars } = Jars.useContainer();
  const { masterchef } = Contracts.useContainer();
  const { multicallProvider } = Connection.useContainer();
  const { prices } = Prices.useContainer();

  const [gauges, setGauges] = useState<GaugeWithApy[] | null>(null);
  const [calculating, setCalculating] = useState(false);

  console.log({ calculating });
  const calculateApy = async (): Promise<void> => {
    if (!inputGauges || !masterchef || !prices || !multicallProvider || !jars || calculating) {
      return;
    }
    setCalculating(true);
    const jarGauges = inputGauges.filter((gauge) => JAR_GAUGE_MAP[gauge.token]);
    const contracts = jarGauges.map((gauge) => {
      const { jarName } = JAR_GAUGE_MAP[gauge.token];
      const gaugeingJar = jars.filter((x) => x.jarName === jarName)[0];
      if (!gaugeingJar) {
        return new Contract(
          mlErc20.dai.address,
          mlErc20.abi,
          multicallProvider,
        );
      }
      return new Contract(
        gaugeingJar.contract.address,
        gaugeingJar.contract.interface.fragments,
        multicallProvider,
      );
    });

    const remain = new Set(contracts.map(contract => contract.address));
    const gaugeBalances: BigNumber[] = await Promise.all(contracts.map(async (contract) => retry(async () => timeout(() => contract.totalSupply(), 3000))));
    const res = jarGauges.map((gauge, idx) => {
      const { jarName } = JAR_GAUGE_MAP[gauge.token];
      const gaugeingJar = jars.filter((x) => x.jarName === jarName)[0];
      // early return for gauges based on deactivated jars
      if (!gaugeingJar) {
        return {
          ...gauge,
          fullApy: 0,
          usdPerToken: 0,
          totalValue: 0,
          valueStakedInGauge: 0,
          numTokensInPool: 0,
        };
      }

      const gaugeBalance = gaugeBalances[idx];
      const numTokensInPool = parseFloat(
        ethers.utils.formatEther(gaugeBalance),
      );

      // calculate APY
      const isUsdc =
        gauge.token.toLowerCase() === PICKLE_JARS.pyUSDC.toLowerCase();
      const valueStakedInGauge =
        (gaugeingJar.usdPerPToken || 0) * numTokensInPool;
      const fullApy = gaugeingJar.usdPerPToken
        ? (gauge.rewardRatePerYear * prices.pickle) / (gaugeingJar.usdPerPToken  * (isUsdc ? 1e12 : 1))
        : 0;
      return {
        ...gauge,
        fullApy,
        usdPerToken: gaugeingJar.usdPerPToken || 0,
        totalValue: gaugeingJar.tvlUSD || 0,
        valueStakedInGauge,
        numTokensInPool,
      };
    });

    setGauges(res);
    setCalculating(false);
  };

  useEffect(() => {
    calculateApy();
  }, [inputGauges]);

  return { jarGaugeWithApy: gauges };
};
