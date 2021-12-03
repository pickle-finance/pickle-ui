/**
 * Tailwind
 */
export const classNames = (...classes: any[]) =>
  classes.filter(Boolean).join(" ");

/**
 * Formatting
 */
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
