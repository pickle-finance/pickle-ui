import { Contract, ethers } from "ethers";
import { useState, useEffect } from "react";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts-Ethereum";
import { Prices } from "../Prices";

import { JAR_FARM_MAP } from "./farms";
import { FarmWithApy } from "./useUniV2Apy";
import { FarmWithReward } from "./useWithReward";
import { Jars } from "../Jars-Ethereum";

import mlErc20 from "@studydefi/money-legos/erc20";

// what comes in and goes out of this function
type Input = FarmWithReward[] | null;
type Output = { jarFarmWithApy: FarmWithApy[] | null };

export const useJarFarmApy = (inputFarms: Input): Output => {
  const { jars } = Jars.useContainer();
  const { masterchef } = Contracts.useContainer();
  const { ethMulticallProvider: multicallProvider } = Connection.useContainer();

  const [farms, setFarms] = useState<FarmWithApy[] | null>(null);

  const { prices } = Prices.useContainer();

  const calculateApy = async () => {
    if (inputFarms && masterchef && jars && prices && multicallProvider) {
      const jarFarms = inputFarms?.filter(
        (farm) => JAR_FARM_MAP[farm.lpToken as keyof typeof JAR_FARM_MAP],
      );

      const farmingJarsMCContracts = jarFarms.map((farm) => {
        const { jarName } = JAR_FARM_MAP[
          farm.lpToken as keyof typeof JAR_FARM_MAP
        ];

        const farmingJar = jars.filter((x) => x.jarName === jarName)[0];

        if (!farmingJar) {
          return new Contract(
            mlErc20.dai.address,
            mlErc20.abi,
            multicallProvider,
          );
        }

        return new Contract(
          farmingJar.contract.address,
          farmingJar.contract.interface.fragments,
          multicallProvider,
        );
      });

      const farmBalances = await Promise.all(
        farmingJarsMCContracts.map((x) => x.balanceOf(masterchef.address)),
      );

      const res = jarFarms.map((farm, idx) => {
        const { jarName } = JAR_FARM_MAP[
          farm.lpToken as keyof typeof JAR_FARM_MAP
        ];

        const farmingJar = jars.filter((x) => x.jarName === jarName)[0];

        // early return for farms based on deactivated jars
        if (!farmingJar) {
          return {
            ...farm,
            apy: 0,
            usdPerToken: 0,
            totalValue: 0,
            valueStakedInFarm: 0,
            numTokensInPool: 0,
          };
        }

        const farmBalance = farmBalances[idx];

        const numTokensInPool = parseFloat(
          ethers.utils.formatEther(farmBalance),
        );

        const valueStakedInFarm =
          (farmingJar.usdPerPToken || 0) * numTokensInPool;

        let apy =
          farm.valueRewarded.perYear &&
          farm.valueRewarded.perYear / valueStakedInFarm;
        if (farm.poolIndex === 16) {
          apy = 0;
        }

        return {
          ...farm,
          apy,
          usdPerToken: farmingJar.usdPerPToken || 0,
          totalValue: farmingJar.tvlUSD || 0,
          valueStakedInFarm,
          numTokensInPool,
        };
      });

      setFarms(res);
    }
  };

  useEffect(() => {
    calculateApy();
  }, [inputFarms, prices, masterchef, jars, multicallProvider]);

  return { jarFarmWithApy: farms };
};
