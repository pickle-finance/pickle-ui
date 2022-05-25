import { BigNumber, ethers } from "ethers";
import { JarApy } from "./Jars/useJarsWithAPYPFCore";
import { Jar as JarContract } from "./Contracts/Jar";
import { Erc20 as Erc20Contract } from "./Contracts/Erc20";
import { UniV3Token, useJarsWithUniV3 } from "./Jars/useJarsWithUniV3";
import { JarV3 as jarV3Contract } from "./Contracts/JarV3";
import { ZapDetails } from "./Jars/useJarsWithZap";

export interface UserJarData {
  name: string;
  ratio: number;
  jarContract: JarContract | jarV3Contract;
  depositToken: Erc20Contract;
  depositTokenName: string;
  depositTokenDecimals: number;
  balance: ethers.BigNumber;
  deposited: ethers.BigNumber;
  usdPerPToken: number;
  APYs: JarApy[];
  totalAPY: number;
  apr: number;
  depositTokenLink: string;
  tvlUSD: number;
  protocol: string;
  stakingProtocol?: string;
  apiKey: string;
  token0: UniV3Token | null;
  token1: UniV3Token | null;
  proportion: BigNumber | null;
  supply: number;
  zapDetails: ZapDetails | null;
}
