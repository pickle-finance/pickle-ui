import { useState, useEffect } from "react";

import { Connection } from "../Connection";

export interface RawFarm {
  poolIndex: number;
  lpToken: string;
  allocPoint: number;
}

export const useFetchFarms = (): { rawFarms: RawFarm[] | null } => {
  const { blockNum, chainName } = Connection.useContainer();
  const [farms, setFarms] = useState<RawFarm[]>([]);

  const getFarms = async () => {
    if (chainName) {
      const network = chainName.toLowerCase();
      const endpoint = `${process.env.API_ROUTES_HOST}/farms/${network}`;
      const response = await fetch(endpoint);
      const farms = await response.json();

      setFarms(farms);
    }
  };

  useEffect(() => {
    getFarms();
  }, [blockNum]);

  return { rawFarms: farms };
};
