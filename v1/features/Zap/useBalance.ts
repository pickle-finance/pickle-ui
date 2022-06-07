import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { Erc20__factory as Erc20Factory } from "../../containers/Contracts/factories/Erc20__factory";
import { Connection } from "../../containers/Connection";
import { ChainNetwork } from "picklefinance-core";

export const tokenInfo = {
  renBTC: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
  wBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  CRV: "0xD533a949740bb3306d119CC777fa900bA034cd52",
  YFI: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
  SUSHI: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
  FEI: "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
  FRAX: "0x853d955acef822db058eb8505911ed77f175b99e",
  ETH: "0x0000000000000000000000000000000000000000",
};

export type TokenSymbol = keyof typeof tokenInfo;

export const useBalance = (symbol: null | keyof typeof tokenInfo) => {
  const { provider, address, blockNum, chainName } = Connection.useContainer();
  const [balanceRaw, setBalance] = useState<BigNumber | null>(null);
  const [balanceStr, setBalanceStr] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number | null>(null);

  const getBalance = async () => {
    if (chainName === ChainNetwork.Polygon)
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
        balanceStr = ethers.utils.formatUnits(balance, 18);
        setDecimals(18);
        setBalance(balance);
        setBalanceStr(balanceStr);
      } else if (tokenInfo[symbol]) {
        const token = Erc20Factory.connect(tokenInfo[symbol], provider);
        const decimals = await token.decimals();
        balance = await token.balanceOf(address);
        setDecimals(decimals);
        balanceStr = ethers.utils.formatUnits(balance, decimals);
        setBalance(balance);
        setBalanceStr(balanceStr);
      } else {
        setBalance(null);
        setBalanceStr(null);
        setDecimals(null);
      }
    }
  };

  useEffect(() => {
    getBalance();
  }, [symbol, provider, address, blockNum]);

  return { balanceRaw, balanceStr, decimals };
};
