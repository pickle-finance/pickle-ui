import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";

import { Contracts, DILL } from "./Contracts";
import { Connection } from "./Connection";
import { Prices } from "../containers/Prices";
import { useProtocolIncome } from "./DILL/useProtocolIncome";
import { ethers } from "ethers";

export interface UseDillOutput {
  lockedAmount?: ethers.BigNumber | null;
  lockEndDate?: ethers.BigNumber | null;
  balance?: ethers.BigNumber | null;
  totalSupply: ethers.BigNumber | null;
  lockedValue: number | null;
  weeklyProfit: number | null;
  weeklyDistribution: number | null;
  nextDistribution: Date | null;
}

export function useDill(): UseDillOutput {
  const { blockNum, address } = Connection.useContainer();
  const { dill } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { weeklyProfit, weeklyDistribution } = useProtocolIncome();
  const [lockedAmount, setLockedAmount] = useState<ethers.BigNumber | null>();
  const [lockEndDate, setLockEndDate] = useState<ethers.BigNumber | null>();
  const [balance, setBalance] = useState<ethers.BigNumber | null>();
  const [totalSupply, setTotalSupply] = useState<ethers.BigNumber | null>(null);
  const [lockedValue, setLockedValue] = useState<number |null>(null)

  useEffect(() => {
    if (dill && address && prices) {
      const f = async () => {
        const dillContract = dill.attach(DILL);

        const [lockStats, balance, totalSupply] = await Promise.all([
          dillContract.locked(address),
          dillContract["balanceOf(address)"](address),
          dillContract["totalSupply()"]()
        ]);

        const totalLockedValue = prices.pickle * parseFloat(ethers.utils.formatEther(totalSupply))

        setLockedAmount(lockStats?.amount);
        setLockEndDate(lockStats?.end);
        setBalance(balance);
        setTotalSupply(totalSupply)
        setLockedValue(totalLockedValue)
      };

      f();
    }
  }, [blockNum, address]);

  return {
    lockedAmount,
    lockEndDate,
    balance,
    totalSupply,
    lockedValue,
    weeklyProfit,
    weeklyDistribution,
    nextDistribution: null // TODO once fee-sharing contract is operational
  };
}

export const Dill = createContainer(useDill);
