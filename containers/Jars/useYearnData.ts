import { useEffect, useState } from "react";

const YEARN_API = "https://vaults.finance/all";

interface YearnVault {
  address: string;
  apy: {
    description: string;
    net_apy: number;
    data: {
      baseApr: number;
      boostedApr: number;
      currentBoost: number;
      netApy: number;
      poolApy: number;
      tokenRewardsApr: number;
      totalApy: number;
    };
  };
  name: string;
}

type YearnVaultsResponse = YearnVault[];

export const useYearnData = () => {
  const [yearnData, setYearnData] = useState<YearnVaultsResponse | null>(null);

  const fetchYearnData = async () =>
    setYearnData(await fetch(YEARN_API).then((x) => x.json()).catch(()=>[]));

  useEffect(() => {
    fetchYearnData();
  }, []);

  return {
    yearnData,
  };
};
