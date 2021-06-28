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
      pickle: "0x6c551cAF1099b08993fFDB5247BE74bE39741B82",
      masterChef: "0x20B2a3fc7B13cA0cCf7AF81A68a14CB3116E8749",
      controller: "0x83074F0aB8EDD2c1508D3F657CeB5F27f6092d09",
      minichef: "0x20B2a3fc7B13cA0cCf7AF81A68a14CB3116E8749"
    },
  },
};
