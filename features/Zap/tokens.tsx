import { ReactNode } from "react";

export const SYMBOL_TO_TOKEN = {
  renBTC: "/renbtc.png",
  wBTC: "/wbtc.png",
  DAI: "/dai.png",
  USDC: "/usdc.png",
  USDT: "/usdt.png",
  ETH: "/ethereum.png",
  CRV: "/crv.png",
  YVECRV: "/yvecrv.png",
  YFI: "/yfi.png",
  SUSHI: "/sushiswap.png",
  FEI: "/fei.png",
  FRAX: "/frax.webp",
};

export const getTokenLabel = (symbol: keyof typeof SYMBOL_TO_TOKEN): ReactNode => (
  <>
    <img src={SYMBOL_TO_TOKEN[symbol]} style={{ width: `24px`, marginRight: `12px` }} />
    <span>{symbol}</span>
  </>
);

export const SYMBOL_TO_LP = {
  renBTCCRV: { jarName: "pJar 0b", imgSrc: "/rencrv.png" },
  "3poolCRV": { jarName: "pJar 0c", imgSrc: "/3crv.png" },
  pDAI: { jarName: "pJar 0.88a", imgSrc: "/pdai.png" },
};

export const getLPLabel = (symbol: keyof typeof SYMBOL_TO_LP): ReactNode => (
  <>
    <img src={SYMBOL_TO_LP[symbol].imgSrc} style={{ width: `24px`, marginRight: `12px` }} />
    <span>
      {SYMBOL_TO_LP[symbol].jarName} ({symbol})
    </span>
  </>
);

export const zapDefaultTokens = [
  { symbol: "ETH", label: getTokenLabel("ETH") },
  { symbol: "USDC", label: getTokenLabel("USDC") },
  { symbol: "USDT", label: getTokenLabel("USDT") },
  { symbol: "DAI", label: getTokenLabel("DAI") },
  { symbol: "wBTC", label: getTokenLabel("wBTC") },
  { symbol: "YFI", label: getTokenLabel("YFI") },
  { symbol: "SUSHI", label: getTokenLabel("SUSHI") },
  { symbol: "CRV", label: getTokenLabel("CRV") },
  { symbol: "FEI", label: getTokenLabel("FEI") },
  { symbol: "FRAX", label: getTokenLabel("FRAX") },
];
