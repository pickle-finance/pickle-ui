import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";

export const formatNumber = (value: number, precision = 0): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  return formatter.format(value);
};

export const formatDate = (value: Date): string => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return formatter.format(value);
};

export const formatDollars = (value: number, precision = 0): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  return formatter.format(value);
};

export const formatPercentage = (value: number, precision = 0): string =>
  value.toLocaleString("en-US", {
    style: "percent",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

export const formatAPY = (apy: number): string => {
  if (apy === Number.POSITIVE_INFINITY) return "∞%";

  const decimalPlaces = Math.log(apy) / Math.log(10) > 4 ? 0 : 2;

  return apy.toFixed(decimalPlaces) + "%";
};

export const shortenAddress = (address: string): string =>
  address ? `${address.substring(0, 5)}…${address.substring(address.length - 4)}` : "";

export const round = (value: number, decimals: number) =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

/**
 * Ethers won't parse a string with more than 18 decimals.
 */
export const truncateToMaxDecimals = (value: string) => {
  const decimalPointIndex = value.indexOf(".");

  if (decimalPointIndex < 0) return value;

  return value.substring(0, decimalPointIndex + 19);
};

export const roundToSignificantDigits = (value: number, digits?: number): number => {
  if (typeof digits === "undefined") return value;
  if (value >= 1) return round(value, digits);

  const string = value.toString();
  const firstSignificantDigitIndex = string.split("").findIndex((value) => parseInt(value) > 0);

  return round(value, firstSignificantDigitIndex + digits - 2);
};

export const bigNumberToTokenNumber = (
  number: BigNumber,
  tokenDecimals: number,
  displayDecimals: number,
): number => {
  const amount = parseFloat(ethers.utils.formatUnits(number, tokenDecimals));

  return roundToSignificantDigits(amount, displayDecimals);
};
