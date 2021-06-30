import { createContainer } from "unstated-next";
import { useEffect, useState } from "react";
import { getPoolData } from "../../util/api.js";

const usePoolData = () => {
  const [poolData, setPoolData] = useState();
  const fetchPoolData = async () => setPoolData(await getPoolData());
    
  useEffect(() => {
    fetchPoolData();
  }, []);

  return {
    poolData,
  };
};

export const PoolData = createContainer(usePoolData);