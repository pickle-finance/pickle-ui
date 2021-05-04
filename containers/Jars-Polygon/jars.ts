import { PriceIds } from "../Prices";

export const PICKLE_JARS = {
  pCOMETHUSDCWETH: "0x9eD7e3590F2fB9EEE382dfC55c71F9d3DF12556c",
};

export const JAR_DEPOSIT_TOKENS = {
  COMETH_USDC_WETH: "0x1Edb2D8f791D2a51D56979bf3A25673D6E783232",
};

export const DEPOSIT_TOKENS_NAME = {
  COMETH_USDC_WETH: "COMETH USDC/WETH",
};

export const JAR_ACTIVE: Record<string, boolean> = {
  [DEPOSIT_TOKENS_NAME.COMETH_USDC_WETH]: true,
};

export const DEPOSIT_TOKENS_LINK = {
  COMETH_USDC_WETH:
    "https://swap.cometh.io/#/add/0x2791bca1f2de4661ed88a30c99a7a9449aa84174/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
};

export const DEPOSIT_TOKENS_JAR_NAMES = {
  COMETH_USDC_WETH: "pJar 0.99r",
};

export const STRATEGY_NAMES = {
  DAI: {
    COMPOUNDv1: "StrategyCompoundDaiV1",
    COMPOUNDv2: "StrategyCmpdDaiV2",
  },
};

const PRICE_IDS: Record<string, PriceIds> = {
  // Ethereum
  "0x6b175474e89094c44da98b954eedeac495271d0f": "dai",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "usdc",
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "usdt",
  "0x57ab1ec28d129707052df4df418d58a2d46d5f51": "susd",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "eth",
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "wbtc",
  "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e": "yfi",
  "0x3449fc1cd036255ba1eb19d65ff4ba2b8903a69a": "bac",
  "0x368b3a58b5f49392e5c9e4c998cb0bb966752e51": "mic",
  "0x4b4d2e899658fb59b1d518b68fe836b100ee8958": "mis",
  "0x5a98fcbea516cf06857215779fd812ca3bef1b32": "ldo",
  "0xc5bddf9843308380375a611c18b50fb9341f502a": "yvecrv",
  "0x106538cc16f938776c7c180186975bca23875287": "bas",
  "0x09a3ecafa817268f77be1283176b946c4ff2e608": "mir",
  "0xa47c8bf37f92abed4a126bda807a7b7498661acd": "ust",
  "0x21ca39943e91d704678f5d00b6616650f066fd63": "mtsla",
  "0xd36932143f6ebdedd872d5fb0651f4b72fd15a84": "maapl",
  "0x13b02c8de71680e71f0820c996e4be43c2f57d15": "mqqq",
  "0x9d1555d8cb3c846bb4f7d5b1b1080872c3166676": "mslv",
  "0x56aa298a19c93c6801fdde870fa63ef75cc0af72": "mbaba",
  "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2": "sushi",
  "0x956f47f50a910163d8bf957cf5846d573e7f87ca": "fei",
  "0xc7283b66eb1eb5fb86327f08e1b5816b0720212b": "tribe",
  "0x5f98805a4e8be255a32880fdec7f6728c6568ba0": "lusd",
  // Polygon
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": "usdc",
  "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619": "eth",
};

export const getPriceId = (tokenAddress: string): PriceIds => {
  const l = tokenAddress.toLowerCase();

  if (PRICE_IDS[l]) return PRICE_IDS[l];
  throw new Error(`Unknown token address: ${tokenAddress}`);
};
