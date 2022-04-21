import { getAddress } from "@ethersproject/address";
export * from "./format";
export * from "./render";
export * from "./waiting";
export * from "./constants";

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

export const noop = () => {};

/**
 * Tailwind
 */
export const classNames = (...classes: any[]) => classes.filter(Boolean).join(" ");

/**
 * SWR
 */
export const fetcher = (...args: [string]) => fetch(...args).then((res) => res.json());

/**
 * Responses
 */
export interface PicklePriceResponse {
  "pickle-finance": {
    usd: number;
  };
}

export interface GasPriceResponse {
  code: number;
  data: {
    rapid: number;
    fast: number;
    standard: number;
    slow: number;
    timestamp: number;
    priceUSD: number;
  };
}
