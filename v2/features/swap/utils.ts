import { BigNumber } from "bignumber.js";

export const getAmountWRTDecimal = (amount: string, decimals: number) =>
  new BigNumber(amount).times(new BigNumber(10).exponentiatedBy(decimals)).toString();

export const getAmountWRTUpperDenom = (amount: string, decimals: number) =>
  new BigNumber(amount)
    .div(new BigNumber(10).exponentiatedBy(decimals))
    .decimalPlaces(6)
    .toString();
