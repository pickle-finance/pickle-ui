import { useEffect, useState } from "react";

const YEARN_API = "https://vaults.finance/all";

export const useYearnData = () => {
  const [yearnData, setYearnData] = useState(null);

  useEffect(() => {
    const fetchYearnData = async () =>
      setYearnData(await fetch(YEARN_API).then((x) => x.json()));
    if (!yearnData) fetchYearnData();
  }, []);

  return {
    yearnData,
  };
};
