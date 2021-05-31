export const roundNumber = (number: number, digits: number) =>
  Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);

export const formatPercent = (decimal: number, min = 2, max = 2) =>
  (decimal * 100).toLocaleString(undefined, {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }) + "%";
