interface Addresses {
  pickle: string;
  masterChef: string;
  controller: string;
  dill?: string;
  gaugeProxy?: string;
  minichef?: string;
}

export enum NETWORK_NAMES { 
  ETH = "Ethereum",
  POLY = "Polygon"
}

export type ChainName = NETWORK_NAMES.ETH | NETWORK_NAMES.POLY | null;

interface Config {
  chains: Record<number, { name: ChainName }>;
  addresses: Record<string, Addresses>;
}

export const config: Config = {
  chains: {
    1: {
      name: NETWORK_NAMES.ETH,
    },
    137: {
      name: NETWORK_NAMES.POLY,
    },
  },
  addresses: {
    Ethereum: {
      pickle: "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
      masterChef: "0xbD17B1ce622d73bD438b9E658acA5996dc394b0d",
      controller: "0x6847259b2B3A4c17e7c43C54409810aF48bA5210",
      dill: "0xbBCf169eE191A1Ba7371F30A1C344bFC498b29Cf",
      gaugeProxy: "0x2e57627ACf6c1812F99e274d0ac61B786c19E74f",
    },
    Polygon: {
      pickle: "0x2b88ad57897a8b496595925f43048301c37615da",
      masterChef: "0x20B2a3fc7B13cA0cCf7AF81A68a14CB3116E8749",
      controller: "0x83074F0aB8EDD2c1508D3F657CeB5F27f6092d09",
      minichef: "0x20B2a3fc7B13cA0cCf7AF81A68a14CB3116E8749"
    },
  },
};

export const BPAddresses = {
  LUSD: "0x5f98805a4e8be255a32880fdec7f6728c6568ba0",
  pBAMM: "0x54bC9113f1f55cdBDf221daf798dc73614f6D972",
  STABILITY_POOL: "0x66017D22b0f8556afDd19FC67041899Eb65a21bb",
  pLQTY: "0x65B2532474f717D5A8ba38078B78106D56118bbb",
  LQTY_GAUGE: "0xA7BC844a76e727Ec5250f3849148c21F4b43CeEA"
}
