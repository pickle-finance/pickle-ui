import { BigNumber } from "bignumber.js";

export const getAmountWRTDecimal = (amount: string, decimals: number) =>
  new BigNumber(amount).times(new BigNumber(10).exponentiatedBy(decimals)).toString();

export const getAmountWRTUpperDenom = (amount: string, decimals: number) =>
  new BigNumber(amount)
    .div(new BigNumber(10).exponentiatedBy(decimals))
    .decimalPlaces(6)
    .toString();
export const convertMintoMicroSec = (val: number) => {
  return val * 60 * 1000;
};
export const calculatePercentage = (val: number): number => {
  return val / 100;
};
