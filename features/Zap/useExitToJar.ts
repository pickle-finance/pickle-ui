import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";
import { Farm, POOL_IDs } from "./farms";

export const useExitToJar = (farm: Farm) => {
  const { address, blockNum } = Connection.useContainer();
  const { masterchef } = Contracts.useContainer();

  const [balance, setBalance] = useState<string | null>(null);

  const getBalance = async () => {
    if (!masterchef || !address) return;

    const { amount } = await masterchef.userInfo(POOL_IDs[farm], address);
    const bal = ethers.utils.formatEther(amount);

    setBalance(bal);
  };

  const exit = async (rawAmount: string) => {
    if (!masterchef || !address) return;

    const amount = ethers.utils.parseEther(rawAmount);
    const tx = await masterchef.withdraw(POOL_IDs[farm], amount);
    await tx.wait();
  };

  useEffect(() => {
    getBalance();
  }, [blockNum, address, masterchef, farm]);

  return { balance, exit };
};
