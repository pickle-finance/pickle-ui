import { useState, useEffect } from "react";
import { FarmWithReward } from "./useWithReward";
import { FarmWithApy } from "../Farms/useUniV2Apy";

interface FarmWithApyMatic extends FarmWithApy, FarmWithReward {
  maticApy: number;
}

// what comes in and goes out of this function
type Input = FarmWithApyMatic[] | null;
type Output = { jarFarmWithMaticApy: FarmWithApyMatic[] | null };

export const useMaticJarApy = (inputFarms: Input): Output => {
  const [farms, setFarms] = useState<FarmWithApyMatic[] | null>(null);
  const calculateApy = async () => {
    if (inputFarms) {
      const farmsWithMatic = inputFarms.map((farm) => {
        const maticApy = farm.maticValuePerYear / farm.valueStakedInFarm;
        return {
          ...farm,
          maticApy,
        };
      });
      setFarms(farmsWithMatic);
    }
  };

  useEffect(() => {
    calculateApy();
  }, [inputFarms]);

  return { jarFarmWithMaticApy: farms };
};
