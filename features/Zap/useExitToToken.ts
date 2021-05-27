import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";
import { PICKLE_JARS } from "../../containers/Jars/jars";

const { parseEther } = ethers.utils;
const { MaxUint256 } = ethers.constants;

const CURVE_POOLS = {
  ren: "0x93054188d876f558f4a66B2EF1d97d16eDf0895B",
  "3pool": "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
};

const CURVE_LP = {
  ren: "0x49849C98ae39Fff122806C06791Fa73784FB3675",
  "3pool": "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
};

export enum Jar {
  prenBTCCRV = "renBTCCRV",
  p3poolCRV = "3poolCRV",
  pDAI = "pDAI",
}

export enum Token {
  renBTC = "renBTC",
  wBTC = "wBTC",
  DAI = "DAI",
  USDC = "USDC",
  USDT = "USDT",
}

const TOKEN: { [key in Token]: string } = {
  renBTC: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d",
  wBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
};

const JAR_ENUM_TO_ADDR: { [key in Jar]: string } = {
  [Jar.prenBTCCRV]: PICKLE_JARS.prenBTCWBTC,
  [Jar.p3poolCRV]: PICKLE_JARS.p3CRV,
  [Jar.pDAI]: PICKLE_JARS.pDAI,
};

export const useExitToToken = (jar: Jar, token: Token) => {
  const { address, blockNum } = Connection.useContainer();
  const { erc20, instabrine } = Contracts.useContainer();
  const [balance, setBalance] = useState<string | null>(null);

  const getBalance = async () => {
    if (!erc20 || !address) return;

    const pToken = erc20.attach(JAR_ENUM_TO_ADDR[jar]);
    const balanceRaw = await pToken.balanceOf(address);

    const bal = ethers.utils.formatEther(balanceRaw);
    setBalance(bal);
  };

  useEffect(() => {
    getBalance();
  }, [erc20, address, blockNum, jar]);

  const approve = async (rawAmount: string) => {
    if (!erc20 || !address || !instabrine) return;
    const amount = parseEther(rawAmount);

    const pToken = erc20.attach(JAR_ENUM_TO_ADDR[jar]);
    const allowance = await pToken.allowance(address, instabrine.address);

    if (!allowance.gte(amount)) {
      const tx = await pToken.approve(instabrine.address, MaxUint256);
      await tx.wait();
    }
  };

  const exit = async (rawAmount: string) => {
    if (!erc20 || !address || !instabrine) return;
    const amount = parseEther(rawAmount);

    if (jar === Jar.pDAI) {
      const tx = await instabrine.pickleJarToPrimitive(
        JAR_ENUM_TO_ADDR[Jar.pDAI],
        amount,
        TOKEN.DAI,
        { gasLimit: 2300000 },
      );
      await tx.wait();
    }

    if (jar === Jar.prenBTCCRV) {
      // renBTC = 0, wBTC = 1
      const tokenIndex = ethers.BigNumber.from(token === Token.renBTC ? 0 : 1);
      const tx = await instabrine.curvePickleJarToPrimitive_1(
        JAR_ENUM_TO_ADDR[Jar.prenBTCCRV],
        amount,
        CURVE_LP.ren,
        CURVE_POOLS.ren,
        tokenIndex,
        TOKEN[token],
      );
      await tx.wait();
    }

    if (jar === Jar.p3poolCRV) {
      // DAI = 0, USDC = 1, USDT = 2
      const tokenIndex = ethers.BigNumber.from(token === Token.USDC ? 1 : 2);
      const tx = await instabrine.curvePickleJarToPrimitive_1(
        JAR_ENUM_TO_ADDR[Jar.p3poolCRV],
        amount,
        CURVE_LP["3pool"],
        CURVE_POOLS["3pool"],
        tokenIndex,
        TOKEN[token],
      );
      await tx.wait();
    }
  };

  return {
    balance,
    approve,
    exit,
  };
};
