import { JAR_DEPOSIT_TOKENS } from "../../containers/Jars/jars";

export const PICKLE_POWER = "pickle-eth";

export const GAUGE_TVL_KEY = {
  [JAR_DEPOSIT_TOKENS.sCRV]: "scrv",
  [JAR_DEPOSIT_TOKENS["3CRV"]]: "3poolcrv",
  [JAR_DEPOSIT_TOKENS.steCRV]: "stecrv",
  [JAR_DEPOSIT_TOKENS.SUSHI_ETH_DAI]: "slp-dai",
  [JAR_DEPOSIT_TOKENS.SUSHI_ETH_USDC]: "slp-usdc",
  [JAR_DEPOSIT_TOKENS.SUSHI_ETH_USDT]: "slp-usdt",
  [JAR_DEPOSIT_TOKENS.SUSHI_ETH_WBTC]: "slp-wbtc",
  [JAR_DEPOSIT_TOKENS.SUSHI_ETH_YFI]: "slp-yfi",
  [JAR_DEPOSIT_TOKENS.SUSHI_ETH_YVECRV]: "yvecrv-eth",
  [JAR_DEPOSIT_TOKENS.SUSHI_ETH]: "sushi-eth",
  [JAR_DEPOSIT_TOKENS.SUSHI_ETH_ALCX]: "alcx-eth",
  [JAR_DEPOSIT_TOKENS.UNIV2_BAC_DAI]: "bac-dai",
  [JAR_DEPOSIT_TOKENS.UNIV2_BAS_DAI]: "bas-dai",
  [JAR_DEPOSIT_TOKENS.UNIV2_MIR_UST]: "mir-ust",
  [JAR_DEPOSIT_TOKENS.UNIV2_MTSLA_UST]: "mtsla-ust",
  [JAR_DEPOSIT_TOKENS.UNIV2_MAAPL_UST]: "maapl-ust",
  [JAR_DEPOSIT_TOKENS.UNIV2_MQQQ_UST]: "mqqq-ust",
  [[JAR_DEPOSIT_TOKENS.UNIV2_MSLV_UST]]: "mslv-ust",
  [JAR_DEPOSIT_TOKENS.UNIV2_MBABA_UST]: "mbaba-ust",
  [JAR_DEPOSIT_TOKENS.UNIV2_FEI_TRIBE]: "fei-tribe",
  [JAR_DEPOSIT_TOKENS.UNIV2_LUSD_ETH]: "lusd-eth",
  [JAR_DEPOSIT_TOKENS.SUSHI_ETH_YVBOOST]: "yvboost-eth",
  [JAR_DEPOSIT_TOKENS.renCRV]: "renbtccrv",
  [JAR_DEPOSIT_TOKENS.lusdCRV]: "lusdcrv",
  [JAR_DEPOSIT_TOKENS.USDC]: "usdc",
};

export const getFormatString = (value) => {
  let tvlStr;
  if (value >= 1000000) {
    tvlStr = `${Number(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    tvlStr = `${Number(value / 1000).toFixed(1)}K`;
  } else tvlStr = Number(value);
  return tvlStr;
};
