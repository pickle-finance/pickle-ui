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
