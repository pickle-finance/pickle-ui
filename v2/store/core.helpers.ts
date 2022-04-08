import { ethers } from "ethers";

import { JarWithData } from "./core";

export const jarSupportsStaking = (jar: JarWithData): boolean => {
  const { farm } = jar;

  if (!farm) return false;

  return farm.farmAddress !== ethers.constants.AddressZero;
};
