import { useEffect, useState } from "react";
import { BigNumber, Contract, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { Balances } from "../Balances";
import { Connection } from "../Connection";
import { ERC20Transfer } from "../Erc20Transfer";
import { FraxAddresses } from "containers/config";
import { Contracts } from "../Contracts";
import { PriceIds, Prices } from "../Prices";
import erc20 from "@studydefi/money-legos/erc20";
import BLensABI from "../ABIs/blens.json";

const DISTRUBTOR_ABI = [
  "function getYieldForDuration() view returns(uint256)",
  "function earned(address) view returns(uint256)",
];
const VEFXS_ABI = ["function totalSupply() view returns(uint256)"];

export const useFrax = () => {
  const { signer, provider, address } = Connection.useContainer();
  const { vefxsVault } = Contracts.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { prices } = Prices.useContainer();
  const [fxsBalance, setFxsBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [fxsApr, setFxsApr] = useState<number>(0);
  const [userLockedFxs, setUserLockedFxs] = useState<number>(0);
  const [userPendingFxs, setUserPendingFxs] = useState<number>(0);
  const [pickleLockedFxs, setPickleLockedFxs] = useState<number>(0);
  const [tvl, setTvl] = useState<number>(0);

  const updateData = async () => {
    if (vefxsVault && prices && address) {
      const feeDistributor = new Contract(FraxAddresses.FXSDistribution, DISTRUBTOR_ABI, provider);
      const veFxs = new Contract(FraxAddresses.veFXS, VEFXS_ABI, provider);

      const [
        weeklyFxs,
        veFxsTotalSupply,
        userPendingFxs,
        feeDistributorEarnedFxs,
        userLockedFxs,
        pickleLockedFxs,
        index,
        supplyIndex,
      ] = (
        await Promise.all([
          feeDistributor.getYieldForDuration(),
          veFxs.totalSupply(),
          vefxsVault.claimable(address),
          feeDistributor.earned(FraxAddresses.locker),
          vefxsVault.balanceOf(address),
          vefxsVault.totalSupply(),
          vefxsVault.index(),
          vefxsVault.supplyIndex(address),
        ])
      ).map((x) => +formatEther(x));

      // 1 FXS = 4 veFXS when locked for 4 years
      const fxsApr = (weeklyFxs * prices.fxs * 52) / veFxsTotalSupply;

      const fxsPending =
        userPendingFxs +
        (feeDistributorEarnedFxs * userLockedFxs) / pickleLockedFxs +
        (index - supplyIndex) * userLockedFxs;

      setFxsBalance(getBalance(FraxAddresses.FXS) || BigNumber.from(0));
      setFxsApr(fxsApr);
      setUserLockedFxs(userLockedFxs);
      setUserPendingFxs(fxsPending);
      setPickleLockedFxs(pickleLockedFxs);
      setTvl(pickleLockedFxs * prices.fxs);
    }
  };

  useEffect(() => {
    updateData();
  }, [tokenBalances, transferStatus]);

  return {
    fxsBalance,
    fxsApr,
    userLockedFxs,
    userPendingFxs,
    pickleLockedFxs,
    tvl,
  };
};
