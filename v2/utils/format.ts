import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";

export const formatNumber = (value: number, precision = 0): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  const result = formatter.format(value);
  if (parseFloat(result) === 0 && value > 0) {
    // We have a problem here. Displaying 0 for non-zero input. Use scientific notation?
    return numberToScientificNotation(value);
  }
  return result;
};

export const numberToScientificNotation = (value: number): string => {
  const exponent = Math.floor(value ? Math.log(value) / Math.log(10) : 0);
  value *= 10 ** (exponent * -1);
  return "" + value + "e" + exponent;
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

export const formatPercentage = (value: number, precision?: number): string => {
  if (value === Number.POSITIVE_INFINITY) return "∞%";
  if (value === 0) precision = 0;
  if (precision === undefined) {
    if (value > 10) {
      precision = 0;
    } else {
      precision = 2;
    }
  }

  return (value / 100).toLocaleString("en-US", {
    style: "percent",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

export const shortenAddress = (address: string): string =>
  address ? `${address.substring(0, 5)}…${address.substring(address.length - 4)}` : "";

export const round = (value: number, decimals: number) =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

/**
 * Ethers won't parse a string with more than a token's decimals.
 */
export const truncateToMaxDecimals = (value: string, decimals = 18) => {
  const decimalPointIndex = value.indexOf(".");

  if (decimalPointIndex < 0) return value;

  return value.substring(0, decimalPointIndex + decimals + 1);
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

export const toTitleCase = (str: string | String) => {
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};
