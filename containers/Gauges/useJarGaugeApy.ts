import { Contract, ethers } from "ethers";
import { useState, useEffect } from "react";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { Prices } from "../Prices";

import { JAR_GAUGE_MAP } from "./gauges";
import { GaugeWithApy } from "./useUniV2Apy";
import { GaugeWithReward } from "./useWithReward";
import { Jars } from "../Jars";
import { PICKLE_JARS } from "../../containers/Jars/jars";

import mlErc20 from "@studydefi/money-legos/erc20";

// what comes in and goes out of this function
type Input = GaugeWithReward[] | null;
type Output = { jarGaugeWithApy: GaugeWithApy[] | null };

export const useJarGaugeApy = (inputGauges: Input): Output => {
  let { jars } = Jars.useContainer();
  const { masterchef } = Contracts.useContainer();
  const { multicallProvider } = Connection.useContainer();

  const [gauges, setGauges] = useState<GaugeWithApy[] | null>(null);

  const { prices } = Prices.useContainer();

  const calculateApy = async () => {
    if (inputGauges && masterchef && prices && multicallProvider) {
      const jarGauges = inputGauges?.filter(
        (gauge) => JAR_GAUGE_MAP[gauge.token as keyof typeof JAR_GAUGE_MAP],
      );

      const gaugeingJarsMCContracts = jarGauges.map((gauge) => {
        const { jarName } = JAR_GAUGE_MAP[
          gauge.token as keyof typeof JAR_GAUGE_MAP
        ];

        const gaugeingJar = jars?.filter((x) => x.jarName === jarName)[0];

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

      const gaugeBalances = await Promise.all(
        gaugeingJarsMCContracts.map((x) => x.balanceOf(masterchef.address)),
      );

      const res = jarGauges.map((gauge, idx) => {
        const { jarName } = JAR_GAUGE_MAP[
          gauge.token as keyof typeof JAR_GAUGE_MAP
        ];

        const gaugeingJar = jars?.filter((x) => x.jarName === jarName)[0];

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
    }
  };

  useEffect(() => {
    calculateApy();
  }, [inputGauges, prices, masterchef, jars, multicallProvider]);

  return { jarGaugeWithApy: gauges };
};
