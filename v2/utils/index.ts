import { getAddress } from "@ethersproject/address";
export * from "./format";
export * from "./render";
export * from "./waiting";

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

export interface EthGasStationResponse {
  fast: number;
  fastest: number;
  safeLow: number;
  average: number;
}
