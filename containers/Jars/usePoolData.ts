import { useEffect, useState } from "react";
import { getPoolData } from "../../util/api.js";

export const usePoolData = () => {
  const [poolData, setPoolData] = useState();

  useEffect(() => {
    const fetchPoolData = async () =>
      setPoolData(await getPoolData());
    if (!poolData) fetchPoolData();
  }, []);

  return {
    poolData,
  };
};
