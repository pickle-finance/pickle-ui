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
  const [
    pickleCore,
    setPickleCore,
  ] = useState<PickleModelJson.PickleModelJson | null>(null);
  const { blockNum, chainId } = Connection.useContainer();
  const [lastFetchBlockNum, setLastFetchBlockNum] = useState<number>(0);

  const fetchPickleCore = async () => {
    if (chainId) {
      if ((blockNum || 0) > lastFetchBlockNum + 3 * blocksPerMinute[chainId]) {
        setLastFetchBlockNum(blockNum!);
        setPickleCore(<PickleModelJson.PickleModelJson>await getPickleCore());
      }
    }
  };

  useEffect(() => {
    fetchPickleCore();
  }, [blockNum]);

  return { pickleCore };
};

export const PickleCore = createContainer(usePickleCore);
