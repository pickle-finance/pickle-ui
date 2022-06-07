export const crvJars = [
  "3poolCRV",
  "renBTCCRV",
  "steCRV",
  "lusdCRV",
  "fraxCRV",
  "USDC",
  "IS3USD",
  //"ALETH",
  "saddled4",
  "MIM3CRV",
];

export const uniJars = [
  "MIR-UST",
  "MTSLA-UST",
  "MAAPL-UST",
  "MQQQ-UST",
  "MSLV-UST",
  "MBABA-UST",
  "FEI-TRIBE",
  //"LUSD-ETH",
  "FOX-ETH",
];

export const sushiJars = [
  "SLP-DAI",
  "SLP-USDC",
  "SLP-USDT",
  "SLP-WBTC",
  "SLP-YFI",
  "yveCRV-ETH",
  "yvBOOST-ETH",
  "SUSHI-ETH",
  "ALCX-ETH",
  "CVX-ETH",
  "LQTY",
  "MIM-ETH",
  "SPELL-ETH",
];

export const polyJars = [
  "COMETH-USDC",
  "COMETH-PICKLE",
  "COMETH-MATIC",
  "DAI",
  "am3CRV",
  "PSLP-USDT",
  "PSLP-MATIC",
  "QLP-MIMATIC",
  "QLP-QI",
  "IS3USD",
  "DINO-USDC",
  "DINO-WETH",
];

export const arbJars = [
  "ArbitrumSlpMimEth",
  "ArbitrumSlpSpellEth",
  "Mim2CRV",
  "DodoHndEth",
  "CrvTricrypto",
  "BalTricrypto",
];

export const powerPool = "PICKLE-ETH";
export const jars = crvJars.concat(uniJars, sushiJars);

export const uncompoundAPY = (apy) => {
  return 100 * 365 * (Math.pow(apy / 100 + 1, 1 / 365) - 1);
};
