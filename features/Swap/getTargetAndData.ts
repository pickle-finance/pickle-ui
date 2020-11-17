import { UserJarData } from "../../containers/UserJars";
import { CurveProxyLogic } from "../../containers/Contracts/CurveProxyLogic";
import { Uniswapv2ProxyLogic } from "../../containers/Contracts/Uniswapv2ProxyLogic";

import {
  isCurveJar,
  isUniswapV2Jar,
  isPrimitiveJar,
  getRemoveCurveData,
  getSupplyCurveData,
  getUniswapUnderlying,
} from "./utils";

export const getTargetAndData = (
  fromJar: UserJarData,
  toJar: UserJarData,
  curveProxyLogic: CurveProxyLogic,
  uniswapv2ProxyLogic: Uniswapv2ProxyLogic,
  dustRefundAddress: string,
): [string[], string[]] => {
  let targets: string[] = [];
  let data: string[] = [];

  const fromJarAddressLowerCase = fromJar.jarContract.address.toLowerCase();
  const toJarAddressLowerCase = toJar.jarContract.address.toLowerCase();

  // Curve -> Curve
  if (
    isCurveJar(fromJarAddressLowerCase) &&
    isCurveJar(toJarAddressLowerCase)
  ) {
    const [remove, removeUnderlying] = getRemoveCurveData(
      fromJarAddressLowerCase,
      curveProxyLogic,
    );
    const [supply, supplyUnderlying] = getSupplyCurveData(
      toJarAddressLowerCase,
      curveProxyLogic,
    );
    const swap = uniswapv2ProxyLogic.interface.encodeFunctionData(
      "swapUniswap",
      [removeUnderlying, supplyUnderlying],
    );

    // If remove == supply
    // No need to swap
    if (removeUnderlying === supplyUnderlying) {
      targets = [curveProxyLogic.address, curveProxyLogic.address];
      data = [remove, supply];
    } else {
      targets = [
        curveProxyLogic.address,
        uniswapv2ProxyLogic.address,
        curveProxyLogic.address,
      ];
      data = [remove, swap, supply];
    }
  }

  // Curve -> Uni
  if (
    isCurveJar(fromJarAddressLowerCase) &&
    isUniswapV2Jar(toJarAddressLowerCase)
  ) {
    const [remove, removeUnderlying] = getRemoveCurveData(
      fromJarAddressLowerCase,
      curveProxyLogic,
    );

    const supply = uniswapv2ProxyLogic.interface.encodeFunctionData(
      "primitiveToLpTokens",
      [removeUnderlying, toJar.depositToken.address, dustRefundAddress],
    );

    targets = [curveProxyLogic.address, uniswapv2ProxyLogic.address];
    data = [remove, supply];
  }

  // Curve -> Primitive
  if (
    isCurveJar(fromJarAddressLowerCase) &&
    isPrimitiveJar(toJarAddressLowerCase)
  ) {
    const [remove, removeUnderlying] = getRemoveCurveData(
      fromJarAddressLowerCase,
      curveProxyLogic,
    );

    const supplyUnderlying = toJar.depositToken.address.toLowerCase();

    if (removeUnderlying.toLowerCase() === supplyUnderlying) {
      targets = [curveProxyLogic.address];
      data = [remove];
    } else {
      const swap = uniswapv2ProxyLogic.interface.encodeFunctionData(
        "swapUniswap",
        [removeUnderlying, supplyUnderlying],
      );

      targets = [curveProxyLogic.address, uniswapv2ProxyLogic.address];
      data = [remove, swap];
    }
  }

  // Uni -> Curve
  if (
    isUniswapV2Jar(fromJarAddressLowerCase) &&
    isCurveJar(toJarAddressLowerCase)
  ) {
    const [supply, supplyUnderlying] = getSupplyCurveData(
      toJarAddressLowerCase,
      curveProxyLogic,
    );

    const remove = uniswapv2ProxyLogic.interface.encodeFunctionData(
      "lpTokensToPrimitive",
      [fromJar.depositToken.address, supplyUnderlying],
    );

    targets = [uniswapv2ProxyLogic.address, curveProxyLogic.address];
    data = [remove, supply];
  }

  // Uni -> Uni
  if (
    isUniswapV2Jar(fromJarAddressLowerCase) &&
    isUniswapV2Jar(toJarAddressLowerCase)
  ) {
    const supplyUnderlying = getUniswapUnderlying(toJarAddressLowerCase);

    const remove = uniswapv2ProxyLogic.interface.encodeFunctionData(
      "lpTokensToPrimitive",
      [fromJar.depositToken.address, supplyUnderlying],
    );

    const supply = uniswapv2ProxyLogic.interface.encodeFunctionData(
      "primitiveToLpTokens",
      [supplyUnderlying, toJar.depositToken.address, dustRefundAddress],
    );

    targets = [uniswapv2ProxyLogic.address, uniswapv2ProxyLogic.address];
    data = [remove, supply];
  }

  // Uni -> Primitive
  if (
    isUniswapV2Jar(fromJarAddressLowerCase) &&
    isPrimitiveJar(toJarAddressLowerCase)
  ) {
    const remove = uniswapv2ProxyLogic.interface.encodeFunctionData(
      "lpTokensToPrimitive",
      [fromJar.depositToken.address, toJar.depositToken.address],
    );

    targets = [uniswapv2ProxyLogic.address];
    data = [remove];
  }

  // Primitive -> Curve
  if (
    isPrimitiveJar(fromJarAddressLowerCase) &&
    isCurveJar(toJarAddressLowerCase)
  ) {
    const removeUnderlying = fromJar.depositToken.address.toLowerCase();

    const [supply, supplyUnderlying] = getSupplyCurveData(
      toJarAddressLowerCase,
      curveProxyLogic,
    );

    const swap = uniswapv2ProxyLogic.interface.encodeFunctionData(
      "swapUniswap",
      [removeUnderlying, supplyUnderlying],
    );

    if (removeUnderlying === supplyUnderlying) {
      targets = [curveProxyLogic.address];
      data = [supply];
    } else {
      targets = [uniswapv2ProxyLogic.address, curveProxyLogic.address];
      data = [swap, supply];
    }
  }

  // Primitive -> Uni
  if (
    isPrimitiveJar(fromJarAddressLowerCase) &&
    isUniswapV2Jar(toJarAddressLowerCase)
  ) {
    const removeUnderlying = fromJar.depositToken.address.toLowerCase();
    const supplyUnderlying = toJar.depositToken.address;

    const supply = uniswapv2ProxyLogic.interface.encodeFunctionData(
      "primitiveToLpTokens",
      [removeUnderlying, supplyUnderlying, dustRefundAddress],
    );

    targets = [uniswapv2ProxyLogic.address];
    data = [supply];
  }

  // Primitive -> Primitive
  if (
    isPrimitiveJar(fromJarAddressLowerCase) &&
    isPrimitiveJar(toJarAddressLowerCase)
  ) {
    const removeUnderlying = fromJar.depositToken.address;
    const supplyUnderlying = toJar.depositToken.address;

    const swap = uniswapv2ProxyLogic.interface.encodeFunctionData(
      "swapUniswap",
      [removeUnderlying, supplyUnderlying],
    );

    targets = [uniswapv2ProxyLogic.address];
    data = [swap];
  }

  return [targets, data];
};
