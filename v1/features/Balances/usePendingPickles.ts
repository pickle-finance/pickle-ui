import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { Connection } from "../../containers/Connection";
import { formatEther } from "ethers/lib/utils";
import { Contracts } from "../../containers/Contracts";
import { UserGauges } from "../../containers/UserGauges";
import { Dill } from "../../containers/Dill";
import { ChainNetwork } from "picklefinance-core";

export const usePendingPickles = (): { pendingPickles: number | null } => {
  const { address, blockNum, chainName } = Connection.useContainer();
  const { minichef } = Contracts.useContainer();
  const { gaugeData } = UserGauges.useContainer();
  const [pendingPickles, setPendingPickles] = useState<number | null>(null);
  const [pendingPicklesMatic, setPendingPicklesMatic] = useState<number | null>(null);
  const dillStats = Dill.useContainer();

  const getData = async () => {
    if (address && gaugeData && chainName === ChainNetwork.Ethereum && dillStats) {
      const totalPendingPickles =
        gaugeData.reduce(
          (a, b) => a + parseFloat(ethers.utils.formatEther(b.harvestable || 0)),
          0,
        ) + (dillStats.userClaimable ? parseFloat(formatEther(dillStats.userClaimable)) : 0);

      setPendingPickles(totalPendingPickles);
    }

    if (
      address &&
      minichef &&
      (chainName === ChainNetwork.Polygon || chainName === ChainNetwork.Arbitrum)
    ) {
      const poolLengthBN = await minichef.poolLength();
      const poolLength = poolLengthBN.toNumber();

      // create array of promises, one for each pool
      const promises: Array<Promise<BigNumber>> = Array(parseInt(poolLength.toString()))
        .fill(0)
        .map((_, poolIndex) => minichef.pendingPickle(poolIndex, address));

      // wait for all promises to resolve
      const pending = await Promise.all(promises);

      // add up all the pending pickles from each pool
      const totalMasterchefPickles = pending.reduce(
        (a, b) => a + Number(ethers.utils.formatUnits(b)),
        0,
      );

      setPendingPickles(totalMasterchefPickles);
    }
  };

  useEffect(() => {
    getData();
  }, [address, blockNum]);

  return { pendingPickles };
};
