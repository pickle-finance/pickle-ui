import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";
import { usePendingPickles } from "./usePendingPickles";
import { MiniPickles, Pickles } from "../../containers/Pickles";

interface IUseBalances {
  pickleBalance: number | null;
  totalSupply: number | null;
  pendingPickles: number | null;
  picklePerBlock: number | null;
  picklePerSecond: number | null;
  pickleBN: ethers.BigNumber | null;
}

export const useBalances = (): IUseBalances => {
  const { address, blockNum } = Connection.useContainer();
  const { pickle } = Contracts.useContainer();
  const { picklePerBlock } = Pickles.useContainer();
  const { picklePerSecond } = MiniPickles.useContainer();

  const [pickleBalance, setPickleBalance] = useState<number | null>(null);
  const [pickleBN, setPickleBN] = useState<ethers.BigNumber | null>(null);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);

  const getData = async () => {
    if (address && pickle) {
      // get pickle balance
      const balanceBN = await pickle.balanceOf(address);
      const balance = ethers.utils.formatUnits(balanceBN);
      setPickleBalance(Number(balance));
      setPickleBN(balanceBN);

      // get pickle total supply
      const totalSupplyBN = await pickle.totalSupply();
      const totalSupply = ethers.utils.formatUnits(totalSupplyBN);
      setTotalSupply(Number(totalSupply));
    }
  };

  useEffect(() => {
    getData();
  }, [address, blockNum, pickle]);

  const { pendingPickles } = usePendingPickles();
  return {
    pickleBalance,
    pickleBN,
    totalSupply,
    pendingPickles,
    picklePerBlock,
    picklePerSecond,
  };
};
