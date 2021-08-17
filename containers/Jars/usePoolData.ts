import { createContainer } from "unstated-next";
import { useEffect, useState } from "react";
import { getPoolData } from "../../util/api.js";

interface Pool {
  apy: number;
  gaugeAddress: string;
  identifier: string;
  jarAddress: string;
  jarApy: number;
  liquidity_locked: number;
  network: string;
  ratio: number;
  tokenAddress: string;
  tokens: number;
}

const usePoolData = () => {
  const [poolData, setPoolData] = useState<Pool[]>([]);
  const fetchPoolData = async () => setPoolData(await getPoolData());

  useEffect(() => {
    fetchPoolData();
  }, []);

  return {
    poolData,
  };
};

export const PoolData = createContainer(usePoolData);
