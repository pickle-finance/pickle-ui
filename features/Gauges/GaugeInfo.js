import { JAR_DEPOSIT_TOKENS } from "../../containers/Jars/jars";

export const PICKLE_POWER = "pickle-eth";

export const GAUGE_TVL_KEY = {
  [JAR_DEPOSIT_TOKENS.Ethereum.sCRV]: "scrv",
  [JAR_DEPOSIT_TOKENS.Ethereum["3CRV"]]: "3poolcrv",
  [JAR_DEPOSIT_TOKENS.Ethereum.steCRV]: "stecrv",
  [JAR_DEPOSIT_TOKENS.Ethereum.SUSHI_ETH_DAI]: "slp-dai",
  [JAR_DEPOSIT_TOKENS.Ethereum.SUSHI_ETH_USDC]: "slp-usdc",
  [JAR_DEPOSIT_TOKENS.Ethereum.SUSHI_ETH_USDT]: "slp-usdt",
  [JAR_DEPOSIT_TOKENS.Ethereum.SUSHI_ETH_WBTC]: "slp-wbtc",
  [JAR_DEPOSIT_TOKENS.Ethereum.SUSHI_ETH_YFI]: "slp-yfi",
  [JAR_DEPOSIT_TOKENS.Ethereum.SUSHI_ETH_YVECRV]: "yvecrv-eth",
  [JAR_DEPOSIT_TOKENS.Ethereum.SUSHI_ETH]: "sushi-eth",
  [JAR_DEPOSIT_TOKENS.Ethereum.SUSHI_ETH_ALCX]: "alcx-eth",
  [JAR_DEPOSIT_TOKENS.Ethereum.UNIV2_MIR_UST]: "mir-ust",
  [JAR_DEPOSIT_TOKENS.Ethereum.UNIV2_MTSLA_UST]: "mtsla-ust",
  [JAR_DEPOSIT_TOKENS.Ethereum.UNIV2_MAAPL_UST]: "maapl-ust",
  [JAR_DEPOSIT_TOKENS.Ethereum.UNIV2_MQQQ_UST]: "mqqq-ust",
  [[JAR_DEPOSIT_TOKENS.Ethereum.UNIV2_MSLV_UST]]: "mslv-ust",
  [JAR_DEPOSIT_TOKENS.Ethereum.UNIV2_MBABA_UST]: "mbaba-ust",
  [JAR_DEPOSIT_TOKENS.Ethereum.UNIV2_FEI_TRIBE]: "fei-tribe",
  [JAR_DEPOSIT_TOKENS.Ethereum.UNIV2_LUSD_ETH]: "lusd-eth",
  [JAR_DEPOSIT_TOKENS.Ethereum.SUSHI_ETH_YVBOOST]: "yvboost-eth",
  [JAR_DEPOSIT_TOKENS.Ethereum.renCRV]: "renbtccrv",
  [JAR_DEPOSIT_TOKENS.Ethereum.lusdCRV]: "lusdcrv",
  [JAR_DEPOSIT_TOKENS.Ethereum.USDC]: "usdc",
  [JAR_DEPOSIT_TOKENS.Ethereum.SUSHI_CVX_ETH]: "cvx-eth",
  [JAR_DEPOSIT_TOKENS.Ethereum.LQTY]: "lqty",
  [JAR_DEPOSIT_TOKENS.Ethereum.SADDLE_D4]: "saddled4",
  [JAR_DEPOSIT_TOKENS.Ethereum.MIM_3CRV]: "mim3crv",
  [JAR_DEPOSIT_TOKENS.Ethereum.SPELL_ETH]: "spell-eth",
  [JAR_DEPOSIT_TOKENS.Ethereum.MIM_ETH]: "mim-eth",
  [JAR_DEPOSIT_TOKENS.Ethereum.UNIV2_FOX_ETH]: "fox-eth",
  [JAR_DEPOSIT_TOKENS.Ethereum.SUSHI_TRU_ETH]: "tru-eth",
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
