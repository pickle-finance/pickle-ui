import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";
import { UserGauges } from "../../containers/UserGauges";

export const usePendingPickles = (): { pendingPickles: number | null } => {
  const { address, blockNum } = Connection.useContainer();
  const { gaugeData } = UserGauges.useContainer();
  const [pendingPickles, setPendingPickles] = useState<number | null>(null);

  const getData = async () => {
    if (address && gaugeData) {
      // add up all the pending pickles from each pool
      const totalPendingPickles = gaugeData.reduce(
        (a, b) => a + parseFloat(
          ethers.utils.formatEther(b.harvestable || 0),
        ),
        0,
      );

      setPendingPickles(totalPendingPickles);
    }
  };

  useEffect(() => {
    getData();
  }, [address, blockNum, gaugeData]);

  return { pendingPickles };
};
