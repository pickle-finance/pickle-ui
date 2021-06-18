import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Connection } from "../Connection";
import { Contracts } from "../Contracts";

export const usePicklePerSecond = (): { picklePerSecond: number | null } => {
  const { address, blockNum } = Connection.useContainer();
  const { minichef } = Contracts.useContainer();
  const [picklePerSecond, setPicklePerSecond] = useState<number | null>(null);

  const getData = async () => {
    if (address && minichef && blockNum) {
      const pps = await minichef.picklePerSecond().catch(() => null);
      if (pps) setPicklePerSecond(parseFloat(ethers.utils.formatEther(pps)));
    }
  };

  useEffect(() => {
    getData();
  }, [address, blockNum, minichef]);

  return { picklePerSecond };
};
