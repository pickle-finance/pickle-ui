import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";

import { Contracts, DILL } from "./Contracts";
import { Connection } from "./Connection";
import { ethers } from "ethers";

export interface UseDillOutput {
  lockedAmount?: ethers.BigNumber | null;
  lockEndDate?: ethers.BigNumber | null;
  balance?: ethers.BigNumber | null;
  totalSupply?: ethers.BigNumber | null;
}

export function useDill(): UseDillOutput {
  const { blockNum, address } = Connection.useContainer();
  const { dill } = Contracts.useContainer();
  const [lockedAmount, setLockedAmount] = useState<ethers.BigNumber | null>();
  const [lockEndDate, setLockEndDate] = useState<ethers.BigNumber | null>();
  const [balance, setBalance] = useState<ethers.BigNumber | null>();
  const [totalSupply, setTotalSupply] = useState<ethers.BigNumber | null>();

  useEffect(() => {
    if (dill && address) {
      const f = async () => {
        const dillContract = dill.attach(DILL);

        const [lockStats, balance, totalSupply] = await Promise.all([
          dillContract.locked(address),
          dillContract["balanceOf(address)"](address),
          dillContract["totalSupply()"](),
        ]);

        setLockedAmount(lockStats?.amount);
        setLockEndDate(lockStats?.end);
        setBalance(balance);
        setTotalSupply(totalSupply);
      };

      f();
    }
  }, [blockNum, address]);

  return {
    lockedAmount,
    lockEndDate,
    balance,
    totalSupply,
  };
}

export const Dill = createContainer(useDill);
