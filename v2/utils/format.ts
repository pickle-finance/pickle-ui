import { BigNumber } from "@ethersproject/bignumber";

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

export const shortenAddress = (address: string): string =>
  `${address.substring(0, 5)}…${address.substring(address.length - 4)}`;

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
