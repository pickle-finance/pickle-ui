import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";

import { Contracts, PICKLE_STAKING_SCRV_REWARDS, PICKLE_STAKING_WETH_REWARDS } from "./Contracts";
import { Connection } from "./Connection";
import { Prices } from "./Prices";
import { ethers } from "ethers";

import { useStakingRewards } from "./Staking/useStakingRewards";
import { ChainNetwork } from "picklefinance-core";

function usePickleStaking() {
  const { blockNum, address, chainName } = Connection.useContainer();
  const { susdPool } = Contracts.useContainer();
  const { prices } = Prices.useContainer();

  const [scrvPrice, setSCRVPrice] = useState<null | number>(null);

  const SCRVRewards = useStakingRewards(PICKLE_STAKING_SCRV_REWARDS, scrvPrice);
  const WETHRewards = useStakingRewards(PICKLE_STAKING_WETH_REWARDS, prices ? prices.eth : null);

  useEffect(() => {
    if (susdPool && chainName === ChainNetwork.Ethereum) {
      const f = async () => {
        const virtualPriceBN = await susdPool.get_virtual_price();
        const virtualPrice = parseFloat(ethers.utils.formatEther(virtualPriceBN));

        setSCRVPrice(virtualPrice);
      };

      f();
    }
  }, [blockNum, susdPool, address]);

  return {
    SCRVRewards,
    WETHRewards,
  };
}

export const PickleStaking = createContainer(usePickleStaking);
