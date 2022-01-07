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
