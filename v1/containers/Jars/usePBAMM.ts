import { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { Balances } from "../Balances";
import { Connection } from "../Connection";
import { ERC20Transfer } from "../Erc20Transfer";
import { BPAddresses } from "v1/containers/config";
import { Contracts } from "../Contracts";
import { PriceIds, Prices } from "../Prices";
import erc20 from "@studydefi/money-legos/erc20";
import BLensABI from "../ABIs/blens.json";
import { Jar__factory as JarFactory } from "../Contracts/factories/Jar__factory";

export const usePBAMM = () => {
  const { signer, provider, address } = Connection.useContainer();
  const { stabilityPool, pBAMM } = Contracts.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const { prices } = Prices.useContainer();
  const [lusdBalance, setLusdBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [pbammBalance, setPbammBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [plqtyBalance, setplqtyBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [pricePerToken, setPricePerToken] = useState<number>(0);
  const [userValue, setUserValue] = useState<number>(0);
  const [lqtyApr, setLqtyApr] = useState<number>(0);
  const [userPendingPLqty, setUserPendingPLqty] = useState<number>(0);
  const [userPendingLqty, setUserPendingLqty] = useState<number>(0);
  const [tvl, setTvl] = useState<number>(0);

  const lusdToken = new Contract(BPAddresses.LUSD, erc20.abi, provider);
  const bLens = new Contract("0x9dcc156dfdc09bb52c7489e6ce5c1a9c90572064", BLensABI, provider);
  const pLQTYContract = provider && JarFactory.connect(BPAddresses.pLQTY, provider);

  const updateData = async () => {
    if (stabilityPool && pBAMM && prices && address) {
      // User balances
      const _lusd = await getBalance(BPAddresses.LUSD);
      const _pbamm = await getBalance(BPAddresses.pBAMM);
      const _plqty = await getBalance(BPAddresses.pLQTY);
      if (_lusd) setLusdBalance(_lusd);
      if (_pbamm) setPbammBalance(_pbamm);
      if (_plqty) setplqtyBalance(_plqty);

      // LUSD value calc
      const lusdNum = await stabilityPool.getCompoundedLUSDDeposit(BPAddresses.pBAMM);

      const ethNum = await provider.getBalance(BPAddresses.pBAMM);
      const totalShares = await pBAMM.totalSupply();
      const ppt =
        (+formatEther(lusdNum) * prices.lusd + +formatEther(ethNum) * prices.eth) /
        +formatEther(totalShares);

      setPricePerToken(ppt);
      setTvl(+formatEther(lusdNum) * prices.lusd);
      setUserValue(ppt * +formatEther(_pbamm || 0));

      // LQTY APR calc
      const remainingLQTY = 13344950;
      const lusdInSP = await lusdToken.balanceOf(BPAddresses.STABILITY_POOL);
      const lqtyApr = (remainingLQTY * prices.lqty) / (+formatEther(lusdInSP) * prices.lusd);
      setLqtyApr(lqtyApr * 100);

      // Pending pLQTY
      const userPLqtyRes = await bLens.callStatic.getUnclaimedLqty(
        address,
        BPAddresses.pBAMM,
        BPAddresses.pLQTY,
      );
      const ratioRes = await pLQTYContract.getRatio();
      const ratio = +formatEther(ratioRes);
      const userPLqty = +formatEther(userPLqtyRes);
      const userLqty = ratio * userPLqty;

      setUserPendingPLqty(userPLqty);
      setUserPendingLqty(userLqty);
    }
  };

  useEffect(() => {
    updateData();
  }, [tokenBalances, transferStatus]);

  return {
    pbammBalance,
    lusdBalance,
    plqtyBalance,
    pricePerToken,
    userValue,
    lqtyApr,
    userPendingPLqty,
    userPendingLqty,
    tvl,
  };
};
