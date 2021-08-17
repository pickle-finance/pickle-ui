import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Connection } from "../Connection";
import { Contracts } from "../Contracts";

export const usePicklePerSecond = (): {
  picklePerSecond: number | null;
  maticPerSecond: number | null;
} => {
  const { address, blockNum } = Connection.useContainer();
  const { minichef, pickleRewarder } = Contracts.useContainer();
  const [picklePerSecond, setPicklePerSecond] = useState<number | null>(null);
  const [maticPerSecond, setMaticPerSecond] = useState<number | null>(null);

  const getData = async () => {
    if (address && minichef && blockNum && pickleRewarder) {
      const pps = await minichef
        .picklePerSecond()
        .catch(() => ethers.BigNumber.from(0));
      setPicklePerSecond(parseFloat(ethers.utils.formatEther(pps)));

      const mps = await pickleRewarder
        .rewardPerSecond()
        .catch(() => ethers.BigNumber.from(0));
      setMaticPerSecond(parseFloat(ethers.utils.formatEther(mps)));
    }
  };

  useEffect(() => {
    getData();
  }, [address, blockNum, minichef]);

  return { picklePerSecond, maticPerSecond };
};
