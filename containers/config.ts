interface Addresses {
  pickle: string;
  masterChef: string;
  controller: string;
  dill?: string;
  gaugeProxy?: string;
}

interface Config {
  chains: Record<number, { name: string }>;
  addresses: Record<string, Addresses>;
}

export const config: Config = {
  chains: {
    1: {
      name: "Ethereum",
    },
    137: {
      name: "Polygon",
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
      masterChef: "0xCD276D529a2EE01a8299D4BF076F13D09d40dEa0",
      controller: "0x254825F93e003D6e575636eD2531BAA948d162dd",
    },
  },
};
