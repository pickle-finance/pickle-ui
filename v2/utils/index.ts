/**
 * Tailwind
 */
export const classNames = (...classes: string[]) =>
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
