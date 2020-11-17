import { useState, useEffect } from "react";
import { BigNumber } from "ethers";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";

import { Contract as MulticallContract } from "ethers-multicall";

export interface RawFarm {
  lpToken: string;
  poolIndex: number;
  allocPoint: BigNumber;
  lastRewardBlock: BigNumber;
  accPicklePerShare: BigNumber;
}

export const useFetchFarms = (): { rawFarms: Array<RawFarm> | null } => {
  const { blockNum, multicallProvider } = Connection.useContainer();
  const { masterchef } = Contracts.useContainer();

  const [farms, setFarms] = useState<Array<RawFarm> | null>(null);

  const getFarms = async () => {
    if (masterchef && multicallProvider) {
      const poolLengthBN = (await masterchef.poolLength()) as BigNumber;
      const poolLength = parseInt(poolLengthBN.toString());

      const mcMasterchef = new MulticallContract(
        masterchef.address,
        masterchef.interface.fragments,
      );

      const farmInfo = await multicallProvider.all(
        Array(parseInt(poolLength.toString()))
          .fill(0)
          .map((_, poolIndex) => {
            return mcMasterchef.poolInfo(poolIndex);
          }),
      );

      // extract response and convert to something we can use
      const farms = farmInfo.map((x, idx) => {
        return {
          ...x,
          poolIndex: idx,
        };
      });

      setFarms(farms);
    }
  };

  useEffect(() => {
    getFarms();
  }, [masterchef, blockNum]);

  return { rawFarms: farms };
};
