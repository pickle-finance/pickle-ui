const WEEK = 7 * 86400;
const MAXTIME = 4 * 365 * 86400;

export const getDayDiff = (date1: Date, date2: Date): number => {
  return Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
};

export const getDayOffset = (date: Date, offset: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + offset);
  return newDate;
};

export const getEpochSecondForDay = (date: Date | undefined): number => {
  if (!date) return 0;
  return Math.ceil(date.getTime() / (1000 * 60 * 60 * 24)) * 60 * 60 * 24;
};

export const getWeekDiff = (date1: Date, date2: Date): number => {
  return Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24 * 7));
};

export const getTimeEpoch = (): number => {
  return Math.ceil(new Date().getTime() / (1000 * 60 * 60 * 24)) * 60 * 60 * 24;
};

export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export const dateFromEpoch = (epoch: number): Date => {
  const date = new Date();
  date.setTime(epoch * 1000);
  return date;
};

export const estimateDillForDate = (
  amount: number,
  unlockDate: Date,
  currentUnlockDate: Date | undefined = undefined,
) => {
  const rounded = Math.floor(getEpochSecondForDay(unlockDate) / WEEK) * WEEK;
  return (
    ((rounded - (currentUnlockDate ? +currentUnlockDate : +new Date()) / 1000) / MAXTIME) * amount
  );
};

export const estimateDillForPeriod = (amount: number, period: number) => {
  return estimateDillForDate(amount, getDayOffset(new Date(), period / 86400));
};

export const roundDateByDillEpochSeconds = (date: Date) => {
  return Math.floor(getEpochSecondForDay(date) / WEEK) * WEEK;
};

export const roundDateByDillEpoch = (date: Date): Date => {
  return new Date(Math.floor(getEpochSecondForDay(date) / WEEK) * WEEK * 1000);
};
