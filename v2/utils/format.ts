import { AssetProtocol } from "picklefinance-core/lib/model/PickleModelJson";

export const formatDollars = (value: number, precision = 0): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  return formatter.format(value);
};

export const formatPercentage = (value: number, precision = 0): string =>
  value.toLocaleString("en-US", {
    style: "percent",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

type ProtocolIdToName = {
  [id in AssetProtocol]: string;
};

const protocols: ProtocolIdToName = {
  uniswap: "Uniswap V2",
  uniswap_v3: "Uniswap V3",
  sushiswap: "SushiSwap",
  sushiswap_polygon: "SushiSwap",
  sushiswap_arbitrum: "SushiSwap",
  sushiswap_harmony: "SushiSwap",
  comethswap: "ComethSwap",
  dodoswap: "DODO",
  quickswap_polygon: "QuickSwap",
  aave_polygon: "Aave",
  iron_polygon: "IRON",
  yearn: "Yearn",
  saddle: "Saddle",
  curve: "Curve",
  compound: "Compound",
  bprotocol: "B.Protocol",
  tokenprice: "Liquity",
  cherryswap: "CherrySwap",
  bxh: "BXH",
  jswap: "JSwap",
  solarswap: "SolarSwap",
  balancer_arbitrum: "Balancer",
  vvs: "VVS",
  trisolaris: "Trisolaris",
  nearpad: "NearPad",
  wannaswap: "WannaSwap",
};

export const protocolIdToName = (id: AssetProtocol): string => protocols[id];
