export * from "./format";

export const noop = () => {};

/**
 * Tailwind
 */
export const classNames = (...classes: any[]) =>
  classes.filter(Boolean).join(" ");

/**
 * SWR
 */
export const fetcher = (...args: [string]) =>
  fetch(...args).then((res) => res.json());

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
