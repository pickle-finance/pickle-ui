import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";

export const usePendingPickles = (): { pendingPickles: number | null } => {
  const { address, blockNum } = Connection.useContainer();
  const { masterchef } = Contracts.useContainer();
  const [pendingPickles, setPendingPickles] = useState<number | null>(null);

  const getData = async () => {
    if (address && masterchef) {
      const poolLengthBN = await masterchef.poolLength();
      const poolLength = poolLengthBN.toNumber();

      // create array of promises, one for each pool
      const promises: Array<Promise<BigNumber>> = Array(
        parseInt(poolLength.toString()),
      )
        .fill(0)
        .map((_, poolIndex) => masterchef.pendingPickle(poolIndex, address));

      // wait for all promises to resolve
      const pendingPickles = await Promise.all(promises);

      // add up all the pending pickles from each pool
      const totalPendingPickles = pendingPickles.reduce(
        (a, b) => a + Number(ethers.utils.formatUnits(b)),
        0,
      );

      setPendingPickles(totalPendingPickles);
    }
  };

  useEffect(() => {
    getData();
  }, [address, blockNum, masterchef]);

  return { pendingPickles };
};
