import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Connection } from "../Connection";
import { Contracts } from "../Contracts";

export const usePicklePerBlock = (): { picklePerBlock: number | null } => {
  const { blockNum } = Connection.useContainer();
  const { masterchef } = Contracts.useContainer();
  const [picklePerBlock, setPicklePerBlock] = useState<number | null>(null);

  const getData = async () => {
    if (masterchef && blockNum) {
      // queue up the promises
      const promises = [
        masterchef.picklePerBlock(),
        masterchef.BONUS_MULTIPLIER(),
        masterchef.bonusEndBlock(),
      ];

      // fetch all data at once
      const [ppb, multiplier, bonusEndBlock] = await Promise.all(promises);

      // apply multiplier if bonus is still in effect
      const picklePerBlock = ethers.BigNumber.from(blockNum).lt(bonusEndBlock)
        ? ppb.mul(multiplier)
        : ppb;

      setPicklePerBlock(parseFloat(ethers.utils.formatEther(picklePerBlock)));
    }
  };

  useEffect(() => {
    getData();
  }, [blockNum, masterchef]);

  return { picklePerBlock };
};
