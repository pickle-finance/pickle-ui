import { useState, useEffect } from "react";
import dayjs from "v1/util/dayjs";

import { StakingRewards } from "../Contracts/StakingRewards";

import { Contracts } from "../Contracts";
import { Connection } from "../Connection";
import { Prices } from "../Prices";
import { ethers } from "ethers";
import { ChainNetwork } from "picklefinance-core";

export interface UseStakingRewardsOutput {
  APY: number | null;
  staked: ethers.BigNumber | null;
  earned: ethers.BigNumber | null;
  rewardForDuration: ethers.BigNumber | null;
  rewardsDurationInDays: number | null;
  pickleStakingRewards: StakingRewards | null;
}

export function useStakingRewards(
  stakingRewardsAddress: string,
  rewardsTokenPrice: number | null,
): UseStakingRewardsOutput {
  const { blockNum, address, chainName } = Connection.useContainer();
  const { stakingRewards, pickle } = Contracts.useContainer();
  const { prices } = Prices.useContainer();

  const [staked, setStaked] = useState<ethers.BigNumber | null>(null);
  const [earned, setEarned] = useState<ethers.BigNumber | null>(null);
  const [APY, setAPY] = useState<number | null>(null);
  const [rewardForDuration, setRewardForDuration] = useState<ethers.BigNumber | null>(null);
  const [rewardsDurationInDays, setRewardsDurationInDays] = useState<number | null>(null);

  const getAPY = async () => {
    if (stakingRewards && pickle && prices) {
      // get Rewards per year
      const weeklyReward = await stakingRewards
        .attach(stakingRewardsAddress)
        .getRewardForDuration();
      const rewardsPerWeek = ethers.utils.formatEther(weeklyReward);
      const rewardsPerYear = parseFloat(rewardsPerWeek) * 52;

      // get totals
      const totalPickleStaked = await pickle.balanceOf(stakingRewardsAddress);
      const totalValueStaked =
        prices.pickle * parseFloat(ethers.utils.formatEther(totalPickleStaked));

      if (rewardsTokenPrice) {
        const valueRewardedPerYear = rewardsTokenPrice * rewardsPerYear;
        setAPY(valueRewardedPerYear / totalValueStaked);
      }
    }
  };

  useEffect(() => {
    if (stakingRewards && address && chainName === ChainNetwork.Ethereum) {
      const f = async () => {
        const pickleRewards = stakingRewards.attach(stakingRewardsAddress);

        const rewardsStats = await Promise.all([
          pickleRewards.earned(address),
          pickleRewards.getRewardForDuration(),
          pickleRewards.rewardsDuration(),
          pickleRewards.balanceOf(address),
          pickleRewards.periodFinish(),
        ]);

        const rewardsDuration = dayjs.duration(rewardsStats[2].toNumber(), "seconds").asDays();

        setEarned(rewardsStats[0]);

        const now = parseInt((new Date().getTime() / 1000).toString());

        // If rewards has ended
        if (rewardsStats[4].toNumber() < now) {
          setRewardForDuration(ethers.constants.Zero);
        } else {
          getAPY();
          setRewardForDuration(rewardsStats[1]);
        }
        setRewardsDurationInDays(rewardsDuration);
        setStaked(rewardsStats[3]);
      };

      f();
    }
  }, [blockNum, address]);

  return {
    APY,
    staked,
    earned,
    rewardForDuration,
    rewardsDurationInDays,
    pickleStakingRewards: stakingRewards ? stakingRewards.attach(stakingRewardsAddress) : null,
  };
}
