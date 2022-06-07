import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Connection } from "../Connection";
import { Contracts } from "../Contracts";

export const usePicklePerSecond = (): {
  picklePerSecond: number | null;
  maticPerSecond: number | null;
} => {
  const { blockNum } = Connection.useContainer();
  const { minichef, pickleRewarder } = Contracts.useContainer();
  const [picklePerSecond, setPicklePerSecond] = useState<number | null>(null);
  const [maticPerSecond, setMaticPerSecond] = useState<number | null>(null);

  const getData = async () => {
    if (minichef && pickleRewarder) {
      const pps = await minichef.picklePerSecond().catch(() => ethers.BigNumber.from(0));
      setPicklePerSecond(parseFloat(ethers.utils.formatEther(pps)));

      const mps = await pickleRewarder.rewardPerSecond().catch(() => ethers.BigNumber.from(0));
      // only wbtc using this now, so hacking it...
      setMaticPerSecond(parseFloat(ethers.utils.formatUnits(mps, 8)));
    }
  };

  useEffect(() => {
    getData();
  }, [blockNum, minichef]);

  return { picklePerSecond, maticPerSecond };
};
