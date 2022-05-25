import { ethers } from "ethers";
import { useState, useEffect } from "react";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { Prices } from "../Prices";

import { useJarFarmMap } from "./farms";
import { FarmWithApy } from "./useUniV2Apy";
import { FarmWithReward } from "./useWithReward";
import { Jars } from "../Jars";
import { PickleCore } from "v1/containers/Jars/usePickleCore";
import { getAddress } from "@ethersproject/address";

// what comes in and goes out of this function
type Input = FarmWithReward[] | null;
type Output = { jarFarmWithApy: FarmWithApy[] | null };

export const useJarFarmApy = (inputFarms: Input): Output => {
  const { jars } = Jars.useContainer();
  const { masterchef } = Contracts.useContainer();
  const { multicallProvider, chainName } = Connection.useContainer();

  const [farms, setFarms] = useState<FarmWithApy[] | null>(null);
  const { pickleCore } = PickleCore.useContainer();

  const { prices } = Prices.useContainer();
  const jarFarmMap = useJarFarmMap();

  const calculateApy = async () => {
    if (inputFarms && masterchef && jars && prices && multicallProvider && chainName) {
      const jarAddresses = jars.map((x) => getAddress(x.contract.address));
      const jarFarms = inputFarms
        .filter((farm) => jarFarmMap[getAddress(farm.lpToken)])
        .filter((x) => jarAddresses.includes(x.lpToken))
        .reduce((p, c) => {
          if (!p.some((el) => el.lpToken === c.lpToken)) p.push(c);
          return p;
        }, []);

      const farmingJarsMCContracts = jarFarms.map((farm) => {
        const { jarName } = jarFarmMap[farm.lpToken];

        const farmingJar = jars.filter((x) => x.jarName === jarName)[0];

        if (!farmingJar) {
          return null;
        }

        return farmingJar.contract;
      });

      const farmBalances = await Promise.all(
        farmingJarsMCContracts.map((x) => {
          if (!x) return Promise.resolve(ethers.BigNumber.from(0));

          return x.balanceOf(masterchef.address).catch(() => ethers.BigNumber.from(0));
        }),
      );

      const res = jarFarms.map((farm, idx) => {
        const { jarName } = jarFarmMap[farm.lpToken];

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

        const numTokensInPool = farmBalance ? parseFloat(ethers.utils.formatEther(farmBalance)) : 0;

        const valueStakedInFarm = (farmingJar.usdPerPToken || 0) * numTokensInPool;

        let apy = farm.valueRewarded.perYear && farm.valueRewarded.perYear / valueStakedInFarm;
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
  }, [inputFarms, prices, masterchef, jars]);

  return { jarFarmWithApy: farms };
};
