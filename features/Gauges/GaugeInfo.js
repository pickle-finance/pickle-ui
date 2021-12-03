export const PICKLE_POWER = "pickle-eth";

export const getFormatString = (value) => {
  let tvlStr;
  if (value >= 1000000) {
    tvlStr = `${Number(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    tvlStr = `${Number(value / 1000).toFixed(1)}K`;
  } else tvlStr = Number(value).toFixed(2);
  return tvlStr;
};
