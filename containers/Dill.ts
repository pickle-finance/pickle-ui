import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";

import { Contracts, DILL, FEE_SHARE } from "./Contracts";
import { Connection } from "./Connection";
import { Prices } from "../containers/Prices";
import { useProtocolIncome } from "./DILL/useProtocolIncome";
import { ethers } from "ethers";

export interface UseDillOutput {
  lockedAmount?: ethers.BigNumber | null;
  lockEndDate?: ethers.BigNumber | null;
  balance?: ethers.BigNumber | null;
  userClaimable?: ethers.BigNumber | null;
  totalSupply: ethers.BigNumber | null;
  lockedValue: number | null;
  weeklyProfit: number | null;
  weeklyDistribution: number | null;
  nextDistribution: Date | null;
}

export function useDill(): UseDillOutput {
  const { blockNum, address } = Connection.useContainer();
  const { dill, feeShare } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const { weeklyProfit, weeklyDistribution } = useProtocolIncome();
  const [lockedAmount, setLockedAmount] = useState<ethers.BigNumber | null>();
  const [lockEndDate, setLockEndDate] = useState<ethers.BigNumber | null>();
  const [balance, setBalance] = useState<ethers.BigNumber | null>();
  const [userClaimable, setUserClaimable] = useState<ethers.BigNumber | null>();
  const [totalSupply, setTotalSupply] = useState<ethers.BigNumber | null>(null);
  const [lockedValue, setLockedValue] = useState<number |null>(null)
  const [nextDistribution, setNextDistribution] = useState<Date |null>(null)

  useEffect(() => {
    if (dill && feeShare && address && prices) {
      const f = async () => {
        const dillContract = dill.attach(DILL);
        const feeShareContract = feeShare.attach(FEE_SHARE)

        const [lockStats, balance, totalSupply, userClaimable, epochStart, currentEpoch, epochTime] = await Promise.all([
          dillContract.locked(address),
          dillContract["balanceOf(address)"](address),
          dillContract["totalSupply()"](),
          feeShareContract["getClaimable(address)"](address),
          feeShareContract["startTime()"](),
          feeShareContract["currentEpoch()"](),
          feeShareContract["epoch_period()"]()
        ]);

        const totalLockedValue = prices.pickle * parseFloat(ethers.utils.formatEther(totalSupply))

        const nextDistribution = new Date(epochStart.add(currentEpoch.mul(epochTime)).toNumber() * 1000)

        setLockedAmount(lockStats?.amount);
        setLockEndDate(lockStats?.end);
        setBalance(balance);
        setTotalSupply(totalSupply)
        setLockedValue(totalLockedValue)
        setUserClaimable(userClaimable.toString() ? userClaimable : null)
        setNextDistribution(nextDistribution)
      };

      f();
    }
  }, [blockNum, address]);

  return {
    lockedAmount,
    lockEndDate,
    balance,
    userClaimable,
    totalSupply,
    lockedValue,
    weeklyProfit,
    weeklyDistribution,
    nextDistribution 
  };
}

export const Dill = createContainer(useDill);
