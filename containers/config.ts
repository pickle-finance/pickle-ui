import { ChainNetwork } from "picklefinance-core";

interface Addresses {
  pickle: string;
  masterChef: string;
  controller: string;
  dill?: string;
  gaugeProxy?: string;
  minichef?: string;
  rewarder?: string;
  sushiMinichef?: string;
  sorbettiere?: string;
}

export enum NETWORK_NAMES {
  ETH = "Ethereum",
  POLY = "Polygon",
  OKEX = "OKEx",
  ARB = "Arbitrum",
  MOONRIVER = "Moonriver",
  CRONOS = "Cronos",
  AURORA = "Aurora"
}

export const NETWORK_NAMES_PFCORE_MAP : any = {
  "Ethereum": ChainNetwork.Ethereum,
  "Polygon": ChainNetwork.Polygon,
  "OKEx": ChainNetwork.OKEx,
  "Arbitrum": ChainNetwork.Arbitrum,
  "Moonriver": ChainNetwork.Moonriver,
  "Cronos": ChainNetwork.Cronos,
  "Aurora": ChainNetwork.Aurora, 
};

export type ChainName =
  | NETWORK_NAMES.ETH
  | NETWORK_NAMES.POLY
  | NETWORK_NAMES.OKEX
  | NETWORK_NAMES.ARB
  | NETWORK_NAMES.MOONRIVER
  | NETWORK_NAMES.CRONOS
  | NETWORK_NAMES.AURORA
  | null;

interface Config {
  chains: Record<number, { name: ChainName }>;
  addresses: Record<string, Addresses>;
}

export const config: Config = {
  chains: {
    1: {
      name: NETWORK_NAMES.ETH,
    },
    66: {
      name: NETWORK_NAMES.OKEX,
    },
    137: {
      name: NETWORK_NAMES.POLY,
    },
    42161: {
      name: NETWORK_NAMES.ARB,
    },
    1285: {
      name: NETWORK_NAMES.MOONRIVER,
    },
    25: {
      name: NETWORK_NAMES.CRONOS,
    },
    1313161554: {
      name: NETWORK_NAMES.AURORA
    }
  },
  addresses: {
    Ethereum: {
      pickle: "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
      masterChef: "0xbD17B1ce622d73bD438b9E658acA5996dc394b0d",
      controller: "0x6847259b2B3A4c17e7c43C54409810aF48bA5210",
      dill: "0xbBCf169eE191A1Ba7371F30A1C344bFC498b29Cf",
      gaugeProxy: "0x2e57627ACf6c1812F99e274d0ac61B786c19E74f",
      sorbettiere: "0xF43480afE9863da4AcBD4419A47D9Cc7d25A647F",
    },
    Polygon: {
      pickle: "0x2b88ad57897a8b496595925f43048301c37615da",
      masterChef: "0x20B2a3fc7B13cA0cCf7AF81A68a14CB3116E8749",
      controller: "0x83074F0aB8EDD2c1508D3F657CeB5F27f6092d09",
      minichef: "0x20B2a3fc7B13cA0cCf7AF81A68a14CB3116E8749",
      rewarder: "0xE28287544005094be096301E5eE6E2A6E6Ef5749",
      sushiMinichef: "0x0769fd68dFb93167989C6f7254cd0D766Fb2841F",
    },
    OKEx: {
      controller: "0xcf05d96b4c6c5a87b73f5f274dce1085bc7fdcc4",
      pickle: "0x0000000000000000000000000000000000000000",
      masterChef: "0x7446BF003b98B7B0D90CE84810AC12d6b8114B62",
      minichef: "0x7446BF003b98B7B0D90CE84810AC12d6b8114B62",
      rewarder: "0x48394297ed0a9e9edcc556faaf4222a932605c56",
    },
    Arbitrum: {
      controller: "0x55d5bcef2bfd4921b8790525ff87919c2e26bd03",
      pickle: "0x965772e0e9c84b6f359c8597c891108dcf1c5b1a",
      masterChef: "0x7ecc7163469f37b777d7b8f45a667314030ace24",
      minichef: "0x7ecc7163469f37b777d7b8f45a667314030ace24",
      rewarder: "0x0000000000000000000000000000000000000000",
      sushiMinichef: "0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3",
      sorbettiere: "0x839De324a1ab773F76a53900D70Ac1B913d2B387",
    },
    Moonriver: {
      controller: "0xc3f393fb40f8cc499c1fe7fa5781495dc6fac9e9",
      pickle: "0x0000000000000000000000000000000000000000",
      masterChef: "0x0000000000000000000000000000000000000000",
      minichef: "0x0000000000000000000000000000000000000000",
      rewarder: "0x0000000000000000000000000000000000000000",
    },
    Cronos: {
      controller: "0xFa3Ad976c0bdeAdDe81482F5Fa8191aE1e7d84C0",
      pickle: "0x0000000000000000000000000000000000000000",
      masterChef: "0x0000000000000000000000000000000000000000",
      minichef: "0x0000000000000000000000000000000000000000",
      rewarder: "0x0000000000000000000000000000000000000000",
    },
    Aurora: {
      controller: "0xdc954e7399e9ADA2661cdddb8D4C19c19E070A8E",
      pickle: "0x291c8fceaca3342b29cc36171deb98106f712c66",
      masterChef: "0x13cc0A2644f4f727db23f5B9dB3eBd72134085b7",
      minichef: "0x13cc0A2644f4f727db23f5B9dB3eBd72134085b7",
      rewarder: "0x0000000000000000000000000000000000000000",
    },
  },
};

export const BPAddresses = {
  LUSD: "0x5f98805a4e8be255a32880fdec7f6728c6568ba0",
  pBAMM: "0x54bC9113f1f55cdBDf221daf798dc73614f6D972",
  STABILITY_POOL: "0x66017D22b0f8556afDd19FC67041899Eb65a21bb",
  pLQTY: "0x65B2532474f717D5A8ba38078B78106D56118bbb",
  LQTY_GAUGE: "0xA7BC844a76e727Ec5250f3849148c21F4b43CeEA",
};
