import { BigNumber } from "@ethersproject/bignumber";

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

/*
 * This function needs cleanup and a more formulaic method, using logs
 * or string length to determine how to divide properly.
 * This ad-hoc method with random numbers is not good enough,
 * but I'm leaving it until I have time to do better
 */
export const bigNumberToTokenNumber = (
  number: BigNumber,
  tokenDecimals: number,
  displayDecimals: number,
): number => {
  let bn2 = BigNumber.from(number.toString());
  const decimalsToChop = tokenDecimals - displayDecimals;
  if (decimalsToChop > 11) {
    // 1e12 is bigger than a number and BigNumber often times
    // has weird effects if you do .div(1e18) or something,
    // so split it into 2 steps
    const denom1 = Math.floor(decimalsToChop / 2);
    bn2 = bn2.div(Math.pow(10, denom1));
    bn2 = bn2.div(Math.pow(10, decimalsToChop - denom1));
  } else {
    bn2 = bn2.div(Math.pow(10, decimalsToChop));
  }
  const digits = bn2.toString().length;
  const digitsOver12 = digits > 11 ? digits - 11 : 0;
  bn2 = bn2.div(Math.pow(10, digitsOver12));
  let numberPrePrecission = bn2.toNumber();
  return numberPrePrecission / Math.pow(10, displayDecimals - digitsOver12);
};
