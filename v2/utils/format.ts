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
