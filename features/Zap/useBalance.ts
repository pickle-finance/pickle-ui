import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { Erc20__factory as Erc20Factory } from "../../containers/Contracts/factories/Erc20__factory";
import { Connection } from "../../containers/Connection";
import { NETWORK_NAMES } from "containers/config";

const tokenInfo = {
  renBTC: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
  wBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  CRV: "0xD533a949740bb3306d119CC777fa900bA034cd52",
  ETH: "",
};

export type TokenSymbol = keyof typeof tokenInfo;

export const useBalance = (symbol: null | keyof typeof tokenInfo) => {
  const { provider, address, blockNum, chainName } = Connection.useContainer();
  const [balanceRaw, setBalance] = useState<BigNumber | null>(null);
  const [balanceStr, setBalanceStr] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number | null>(null);

  const getBalance = async () => {
    if (chainName === NETWORK_NAMES.POLY)
      return {
        balanceRaw: 0,
        balanceStr: null,
        decimals: 0,
      };
    if (symbol && provider && address) {
      let balance = BigNumber.from(0);
      let balanceStr = "0";
      if (symbol == "ETH") {
        balance = await provider.getBalance(address);
        balanceStr = ethers.utils.formatUnits(balance, decimals);
        setDecimals(18);
        setBalance(balance);
        setBalanceStr(balanceStr);
      } else {
        const token = Erc20Factory.connect(tokenInfo[symbol], provider);
        const decimals = await token.decimals();
        balance = await token.balanceOf(address);
        balanceStr = ethers.utils.formatUnits(balance, decimals);
        setDecimals(decimals);
        setBalance(balance);
        setBalanceStr(balanceStr);
      }
    }
  };

  useEffect(() => {
    getBalance();
  }, [symbol, provider, address, blockNum]);

  return { balanceRaw, balanceStr, decimals };
};
