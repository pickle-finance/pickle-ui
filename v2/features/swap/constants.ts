export const GPv2VaultRelayerAddress: {
  [chainId: string]: {
    address: string;
    transactionHash: string;
  };
} = {
  "1": {
    address: "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110",
    transactionHash: "0xf49f90aa5a268c40001d1227b76bb4dd8247f18361fcad9fffd4a7a44f1320d3",
  },
  "4": {
    address: "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110",
    transactionHash: "0x609fa2e8f32c73c1f5dc21ff60a26238dacb50d4674d336c90d6950bdda17a21",
  },
  "100": {
    address: "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110",
    transactionHash: "0x9ddc538f89cd8433f4a19bc4de0de27e7c68a1d04a14b327185e4bba9af87133",
  },
};

export const DELAY_FOR_QOUTE = 10;
export const DELAY_FOR_BALANCES = 30;
const baseUrl = "https://explorer.cow.fi";
export const COW_SWAP_EXPLORER = {
  "1": baseUrl,
  "4": `${baseUrl}/rinkeby`,
  "100": `${baseUrl}/xdai`,
};

export const DEFAULT_SLIPPAGE_TOLERANCE = 10;
export const DEFAULT_DEADLINE_IN_MIN = 30;
