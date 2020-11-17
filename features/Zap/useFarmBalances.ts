import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { Connection } from "../../containers/Connection";
import { Prices } from "../../containers/Prices";
import { UserFarmData, UserFarms } from "../../containers/UserFarms";

const toNumber = (bn: BigNumber) => parseFloat(ethers.utils.formatEther(bn));

const PTOKEN_ADDR = {
  prenCRV: "0x2E35392F4c36EBa7eCAFE4de34199b2373Af22ec",
  p3CRV: "0x1BB74b5DdC1f4fC91D6f9E7906cf68bc93538e33",
  pDAI: "0x6949Bb624E8e8A90F87cD2058139fcd77D2F3F87",
};

interface Data {
  stakedValue: number;
  pendingPickle: number;
  totalValue: number;
}

export const useFarmBalances = () => {
  const { blockNum } = Connection.useContainer();
  const { farmData } = UserFarms.useContainer();
  const { prices } = Prices.useContainer();

  const [prenCRVData, setprenCRVData] = useState<Data | null>(null);
  const [p3CRVData, setp3CRVData] = useState<Data | null>(null);
  const [pDAIData, setpDAIData] = useState<Data | null>(null);

  const fetchBalances = async () => {
    if (farmData && prices) {
      const getFarm = (fd: UserFarmData[], addr: string) =>
        fd.filter((f) => f.depositToken.address === addr)[0];

      const a = getFarm(farmData, PTOKEN_ADDR.prenCRV);
      const b = getFarm(farmData, PTOKEN_ADDR.p3CRV);
      const c = getFarm(farmData, PTOKEN_ADDR.pDAI);

      const farmToData = (farm: UserFarmData) => {
        const stakedValue = farm.usdPerToken * toNumber(farm.staked);
        const pendingPickle = toNumber(farm.harvestable);
        const totalValue = stakedValue + pendingPickle * prices.pickle;
        return {
          stakedValue,
          pendingPickle,
          totalValue,
        };
      };

      setprenCRVData(farmToData(a));
      setp3CRVData(farmToData(b));
      setpDAIData(farmToData(c));
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [farmData, blockNum, prices]);

  return { prenCRVData, p3CRVData, pDAIData };
};
