import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";

import { CurveProxyLogic } from "../../containers/Contracts/CurveProxyLogic";
import { PICKLE_JARS } from "../../containers/Jars/jars";
import {
  THREE_CRV,
  THREE_POOL_ADDR,
  RENBTC_CRV,
  RENBTC_POOL_ADDR,
  SUSDV2_DEPOSIT_ADDR,
  SUSDV2_CRV,
  SUSD_POOL_ADDR,
} from "../../containers/Contracts";

export const isCurveJar = (address: string): boolean => {
  const l = address.toLowerCase();

  return (
    l === PICKLE_JARS.p3CRV.toLowerCase() ||
    l === PICKLE_JARS.psCRV.toLowerCase() ||
    l === PICKLE_JARS.prenBTCWBTC.toLowerCase()
  );
};

export const isUniswapV2Jar = (address: string): boolean => {
  const l = address.toLowerCase();

  return (
    l === PICKLE_JARS.pUNIETHDAI.toLowerCase() ||
    l === PICKLE_JARS.pUNIETHUSDC.toLowerCase() ||
    l === PICKLE_JARS.pUNIETHUSDT.toLowerCase() ||
    l === PICKLE_JARS.pUNIETHWBTC.toLowerCase()
  );
};

export const isPrimitiveJar = (address: string): boolean => {
  const l = address.toLowerCase();

  return l === PICKLE_JARS.pDAI.toLowerCase();
};

export const getUniswapUnderlying = (jarAddressLowerCase: string): string => {
  if (jarAddressLowerCase === PICKLE_JARS.pUNIETHDAI.toLowerCase()) {
    return erc20.dai.address;
  }

  if (jarAddressLowerCase === PICKLE_JARS.pUNIETHUSDC.toLowerCase()) {
    return erc20.usdc.address;
  }

  if (jarAddressLowerCase === PICKLE_JARS.pUNIETHUSDT.toLowerCase()) {
    return "0xdac17f958d2ee523a2206206994597c13d831ec7";
  }

  if (jarAddressLowerCase === PICKLE_JARS.pUNIETHWBTC.toLowerCase()) {
    return erc20.wbtc.address;
  }

  throw new Error("Unknown Jar");
};

export const getRemoveCurveData = (
  fromJarAddressLowerCase: string,
  curveProxyLogic: CurveProxyLogic,
): [string, string] => {
  let curve = "";
  let curveLp = "";
  let index = ethers.BigNumber.from(0);
  let underlying = "";

  if (fromJarAddressLowerCase === PICKLE_JARS.p3CRV.toLowerCase()) {
    curve = THREE_POOL_ADDR;
    curveLp = THREE_CRV;
    index = ethers.BigNumber.from(0);
    underlying = erc20.dai.address;
  }

  if (fromJarAddressLowerCase === PICKLE_JARS.psCRV.toLowerCase()) {
    curve = SUSDV2_DEPOSIT_ADDR;
    curveLp = SUSDV2_CRV;
    index = ethers.BigNumber.from(0);
    underlying = erc20.dai.address;
  }

  if (fromJarAddressLowerCase === PICKLE_JARS.prenBTCWBTC.toLowerCase()) {
    curve = RENBTC_POOL_ADDR;
    curveLp = RENBTC_CRV;
    index = ethers.BigNumber.from(1);
    underlying = erc20.wbtc.address;
  }

  return [
    curveProxyLogic.interface.encodeFunctionData("remove_liquidity_one_coin", [
      curve,
      curveLp,
      index,
    ]),
    underlying,
  ];
};

export const getSupplyCurveData = (
  toJarAddressLowerCase: string,
  curveProxyLogic: CurveProxyLogic,
): [string, string] => {
  let curve = "";
  let curveFunctionSig: ethers.BytesLike = "";
  let curvePoolSize: ethers.BigNumber = ethers.BigNumber.from(0);
  let curveUnderlyingIndex: ethers.BigNumber = ethers.BigNumber.from(0);
  let curveUnderlying = "";

  if (toJarAddressLowerCase === PICKLE_JARS.p3CRV.toLowerCase()) {
    curve = THREE_POOL_ADDR;
    curveFunctionSig = ethers.utils
      .id("add_liquidity(uint256[3],uint256)")
      .slice(0, 10);
    curvePoolSize = ethers.BigNumber.from(3);
    curveUnderlyingIndex = ethers.BigNumber.from(0);
    curveUnderlying = erc20.dai.address;
  }

  if (toJarAddressLowerCase === PICKLE_JARS.psCRV.toLowerCase()) {
    curve = SUSD_POOL_ADDR;
    curveFunctionSig = ethers.utils
      .id("add_liquidity(uint256[4],uint256)")
      .slice(0, 10);
    curvePoolSize = ethers.BigNumber.from(4);
    curveUnderlyingIndex = ethers.BigNumber.from(0);
    curveUnderlying = erc20.dai.address;
  }

  if (toJarAddressLowerCase === PICKLE_JARS.prenBTCWBTC.toLowerCase()) {
    curve = RENBTC_POOL_ADDR;
    curveFunctionSig = ethers.utils
      .id("add_liquidity(uint256[2],uint256)")
      .slice(0, 10);
    curvePoolSize = ethers.BigNumber.from(2);
    curveUnderlyingIndex = ethers.BigNumber.from(1);
    curveUnderlying = erc20.wbtc.address;
  }

  return [
    curveProxyLogic.interface.encodeFunctionData("add_liquidity", [
      curve,
      curveFunctionSig,
      curvePoolSize,
      curveUnderlyingIndex,
      curveUnderlying,
    ]),
    curveUnderlying,
  ];
};
