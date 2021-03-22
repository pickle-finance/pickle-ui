import { getDayOffset, getEpochSecondForDay } from "./date";

const WEEK = 7 * 86400;
const MAXTIME = 4 * 365 * 86400;

export const estimateDillForDate = (amount: number, unlockDate: Date) => {
  const rounded = Math.floor(getEpochSecondForDay(unlockDate) / WEEK) * WEEK;
  return ((rounded - +new Date() / 1000) / MAXTIME) * amount;
};

export const estimateDillForPeriod = (amount: number, period: number) => {
  return estimateDillForDate(amount, getDayOffset(new Date(), period / 86400));
};
