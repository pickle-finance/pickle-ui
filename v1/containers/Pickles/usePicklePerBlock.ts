import { BigNumber, ethers } from "ethers";
import { NULL_ADDRESS } from "picklefinance-core/lib/model/PickleModel";
import { useEffect, useState } from "react";
import { Connection } from "../Connection";
import { Contracts } from "../Contracts";

export const usePicklePerBlock = (): { picklePerBlock: number | null } => {
  const { blockNum } = Connection.useContainer();
  const { chainId } = Connection.useContainer();
  const { masterchef } = Contracts.useContainer();
  const [picklePerBlock, setPicklePerBlock] = useState<number | null>(null);

  const getData = async () => {
    if (masterchef?.address != NULL_ADDRESS && blockNum) {
      const picklePerBlock = BigNumber.from(1);

      setPicklePerBlock(parseFloat(ethers.utils.formatEther(picklePerBlock || BigNumber.from(0))));
    }
  };

  useEffect(() => {
    getData();
  }, [blockNum, masterchef]);

  return { picklePerBlock };
};
