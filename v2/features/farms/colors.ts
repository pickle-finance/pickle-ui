import chroma from "chroma-js";

import { theme } from "tailwind.config";

const defaultColor = theme.extend.colors.gray.outline;
export const defaultBackgroundColor = chroma(defaultColor).alpha(0.7).css();

/**
 * These colors are used as placeholders while token/protocol icons are loading.
 * Please keep it sorted.
 */
const colors: { [token: string]: string } = {
  "2crv": "#ffad00",
  "3crv": "#ffad00",
  aave: "#4aa4be",
  alcx: "#edc0a1",
  alusd: "#edc0a1",
  arbitrum: "#2c374c",
  aurora: "#6ed34a",
  auroraswap: "#25caa0",
  aurum: "#e58200",
  avax: "#e84142",
  balancer: "#1e1e1e",
  beam: "#7740ca",
  beamswap: "#7740ca",
  bifi: "#c3bbaf",
  bnb: "#f3ba2f",
  bprotocol: "#26c068",
  brl: "#25caa0",
  btc: "#f7931a",
  btck: "#f7931a",
  busd: "#f3ba2f",
  bxh: "#000318",
  che: "#ffccd6",
  cherry: "#ffccd6",
  cherryswap: "#ffccd6",
  comethswap: "#1d80b7",
  compound: "#00d395",
  cro: "#20254d",
  cronos: "#051221",
  crv: "#ffad00",
  curve: "#1cffdb",
  cvx: "#3a3a3a",
  cvxcrv: "#40ffb7",
  dai: "#f5ac37",
  daik: "#f5ac37",
  dino: "#94cc76",
  dodo: "#fff706",
  eth: "#627eea",
  ethk: "#627eea",
  fei: "#22996e",
  fox: "#202b4e",
  frax: "#fdfdfd",
  glmr: "#1d2549",
  gohm: "#708b96",
  hades: "#ef4625",
  harmony: "#45dfcd",
  hellshare: "#8a25ef",
  hnd: "#859fb5",
  iron: "#eb6d22",
  jf: "#3f38dd",
  jswap: "#3f38dd",
  liquity: "#2eb6ea",
  looks: "#04cd58",
  looksrare: "#04cd58",
  luna: "#082351",
  lusd: "#745ddf",
  maapl: "#000000",
  magic: "#f04545",
  mai: "#db3737",
  matic: "#8247e5",
  mbaba: "#ff6600",
  metis: "#00dacc",
  mim: "#5452fd",
  mimatic: "#db3737",
  mir: "#172240",
  moonbeam: "#e1147b",
  moonriver: "#f2b705",
  movr: "#f2b705",
  mqqq: "#000ad2",
  mslv: "#ed8b00",
  mtsla: "#e31837",
  must: "#a7e1d6",
  near: "#fdfdfd",
  nearpad: "#4c50aa",
  netswap: "#0058f5",
  nett: "#0058f5",
  okex: "#0d74f5",
  optimism: "#ff0420",
  pad: "#6366f1",
  pets: "#f3278d",
  pickle: "#48c148",
  polygon: "#8247e5",
  qi: "#ff6b6b",
  quickswap: "#418aca",
  raider: "#1e1833",
  relay: "#d34fa0",
  rib: "#cccf7d",
  rly: "#ff7101",
  rose: "#c50000",
  saddle: "#fffee8",
  shib: "#ffa500",
  solar: "#dd6499",
  solarswap: "#dc609b",
  spell: "#221b47",
  stella: "#b5176e",
  stellaswap: "#c11672",
  sushi: "#e45ca9",
  sushiswap: "#e45ca9",
  tethys: "#cbb174",
  tri: "#ec0052",
  trisolaris: "#ec0052",
  tru: "#1a5aff",
  uniswapv2: "#ff007a",
  uniswapv3: "#ff007a",
  usdc: "#2775ca",
  usdt: "#26a17b",
  ust: "#5493f7",
  vvs: "#2c3852",
  wanna: "#f4cc5d",
  wannaswap: "#ff007a",
  wbtc: "#ef9242",
  weth: "#627eea",
  wokt: "#0d74f5",
  work: "#010fbe",
  yearn: "#006eee",
  yfi: "#006eee",
  yvboost: "#fa7d09",
  zip: "#34a5f5",
  zipswap: "#34a5f5",
};

export const brandColor = (symbol: string): string => {
  const color = colors[symbol] ?? defaultColor;

  return chroma(color).alpha(0.7).css();
};
