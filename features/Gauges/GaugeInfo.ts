export const PICKLE_POWER = "pickle-eth";

export const getFormatString = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else return value?.toFixed(2);
};
