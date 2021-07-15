import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { Balances } from "../Balances";
import { Connection } from "../Connection";
import { ERC20Transfer } from "../Erc20Transfer";
import { BPAddresses } from "containers/config";
import { Contracts } from "../Contracts";

export const usePBAMM = () => {
  const { signer, provider } = Connection.useContainer();
  const { stabilityPool, pBAMM } = Contracts.useContainer();
  const { status: transferStatus } = ERC20Transfer.useContainer();
  const { tokenBalances, getBalance } = Balances.useContainer();
  const [lusdBalance, setLusdBalance] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(0),
  );
  const [pbammBalance, setPbammBalance] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(0),
  );
  const [plqtyBalance, setplqtyBalance] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(0),
  );
  const [pricePerToken, setPricePerToken] = useState<number>(0);
  const [userValue, setUserValue] = useState<number>(0);

  const updateData = async () => {
    if (stabilityPool && pBAMM) {
      // User balances
      const _lusd = await getBalance(BPAddresses.LUSD);
      const _pbamm = await getBalance(BPAddresses.pBAMM);
      const _plqty = await getBalance(BPAddresses.pLQTY);
      if (_lusd) setLusdBalance(_lusd);
      if (_pbamm) setPbammBalance(_pbamm);
      if (_plqty) setplqtyBalance(_plqty);
      // LUSD value calc
      const lusdValue = await stabilityPool.getCompoundedLUSDDeposit(
        BPAddresses.pBAMM,
      );
      const totalShares = await pBAMM.totalSupply();
      const ppt = +formatEther(lusdValue) / +formatEther(totalShares);

      setPricePerToken(ppt);
      setUserValue(ppt * +formatEther(_pbamm || 0));
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
  };
};
