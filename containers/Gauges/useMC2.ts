import { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { Balances } from "../Balances";
import { Connection } from "../Connection";
import { Contracts, PICKLE_ETH_SLP } from "../Contracts";
import { SushiPairs } from "../SushiPairs";
import { PriceIds, Prices } from "../Prices";
import erc20 from "@studydefi/money-legos/erc20";
import { addresses } from "../SushiPairs";
import { Contract as MulticallContract } from "ethers-multicall";

const PID = 3;
const AVERAGE_BLOCK_TIME = 13.22;

export interface MC2Apy {
  [k: string]: number;
}

export const useMC2 = () => {
  const { signer, provider, address, multicallProvider } = Connection.useContainer();
  const { masterchefV2, pickleSushiRewarder } = Contracts.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { prices } = Prices.useContainer();
  const { getPairData } = SushiPairs.useContainer();
  const [slpBalance, setSlpBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [pricePerToken, setPricePerToken] = useState<number>(0);
  const [userValue, setUserValue] = useState<number>(0);
  const [apy, setApy] = useState<MC2Apy>();
  const [pendingPickle, setPendingPickle] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [pendingSushi, setPendingSushi] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [slpStaked, setSlpStaked] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [tvl, setTvl] = useState<number>(0);

  const updateData = async () => {
    if (
      masterchefV2 &&
      prices &&
      address &&
      multicallProvider &&
      getPairData &&
      pickleSushiRewarder
    ) {
      // User balances
      const _slp = await getBalance(PICKLE_ETH_SLP);
      const [_stakedSlp] = await masterchefV2.userInfo(PID, address);
      if (_slp) setSlpBalance(_slp);
      if (_stakedSlp) setSlpStaked(_stakedSlp);

      // Value calculations
      const pickleToken = new MulticallContract(addresses.pickle, erc20.abi);
      const wethToken = new MulticallContract(addresses.weth, erc20.abi);
      const slpToken = new MulticallContract(PICKLE_ETH_SLP, erc20.abi);

      const { pricePerToken } = await getPairData(PICKLE_ETH_SLP);
      setUserValue(pricePerToken * +formatEther(_stakedSlp || 0));
      setPricePerToken(pricePerToken);

      // APY calc - SUSHI
      const multicallMC2 = new MulticallContract(masterchefV2.address, [
        ...masterchefV2.interface.fragments,
      ]);

      const [
        sushiPerBlockBN,
        totalAllocPointBN,
        poolInfo,
        totalSupplyBN,
      ] = await multicallProvider.all([
        multicallMC2.sushiPerBlock(),
        multicallMC2.totalAllocPoint(),
        multicallMC2.poolInfo(PID),
        slpToken.balanceOf(masterchefV2.address),
      ]);

      const totalSupply = parseFloat(formatEther(totalSupplyBN));
      setTvl(pricePerToken * totalSupply);
      const sushiRewardsPerBlock =
        (parseFloat(formatEther(sushiPerBlockBN)) * 0.9 * poolInfo.allocPoint.toNumber()) /
        totalAllocPointBN.toNumber();

      const sushiRewardsPerYear =
        sushiRewardsPerBlock * ((360 * 24 * 60 * 60) / AVERAGE_BLOCK_TIME);
      const valueRewardedPerYear = prices.sushi * sushiRewardsPerYear;

      const totalValueStaked = totalSupply * pricePerToken;
      const sushiAPY = valueRewardedPerYear / totalValueStaked;
      // { sushi: getCompoundingAPY(sushiAPY * 0.8), apr: sushiAPY * 0.8 * 100 },

      // APY calc - PICKLE
      const picklePerSecondBN = await pickleSushiRewarder.rewardPerSecond();
      const pickleRewardsPerYear =
        parseFloat(formatEther(picklePerSecondBN)) * (360 * 24 * 60 * 60);

      const pickleValuePerYear = prices.pickle * pickleRewardsPerYear;
      const pickleAPY = pickleValuePerYear / totalValueStaked;

      const APY = {
        pickle: pickleAPY,
        sushi: sushiAPY,
      };
      setApy(APY);

      // Pending Rewards
      const harvestablePickle = await pickleSushiRewarder.pendingToken(PID, address);
      const harvestableSushi = await masterchefV2.pendingSushi(PID, address);
      setPendingPickle(harvestablePickle);
      setPendingSushi(harvestableSushi);
    }
  };

  useEffect(() => {
    updateData();
  }, [tokenBalances]);

  return {
    slpStaked,
    slpBalance,
    userValue,
    apy,
    pendingPickle,
    pendingSushi,
    tvl,
  };
};
