import { useState, useEffect } from "react";
import { getPickleCore } from "../../util/api";
import { createContainer } from "unstated-next";
import { Connection } from "../Connection";
import { PickleModelJson } from "picklefinance-core";

const blocksPerMinute: Record<number, number> = {
  1: 4.6, // eth
  137: 30, // poly
  42161: 20, // arb
  66: 20, // oec
  1666600000: 30, // harmony
  1285: 4.3, // moonriver
  25: 5.7, // cronos
  1313161554: 1, // aurora
  1088: 17, // aurora
};

const usePickleCore = () => {
  const [pickleCore, setPickleCore] = useState<PickleModelJson.PickleModelJson | null>(null);

  const fetchPickleCore = async () => {
    setPickleCore(<PickleModelJson.PickleModelJson>await getPickleCore());
  };

  useEffect(() => {
    fetchPickleCore();
    const interval = setInterval(() => {
      fetchPickleCore();
    }, 180000);
    return () => clearInterval(interval);
  }, []);

  return { pickleCore };
};

export const PickleCore = createContainer(usePickleCore);
