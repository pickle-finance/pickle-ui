export const roundNumber = (number: number, digits: number) =>
  Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);
