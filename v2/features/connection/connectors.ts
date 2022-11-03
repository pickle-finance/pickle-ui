import { initializeConnector, Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";

import { MetaMask } from "@web3-react/metamask";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnect } from "@web3-react/walletconnect";
import { CoinbaseWallet } from "@web3-react/coinbase-wallet";

import chains from "./chainIds.json";

export enum Connectors {
  Metamask,
  WalletConnect,
  Coinbase,
  Clover,
}

const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  1: process.env.infura!,
  66: "https://exchainrpc.okex.org",
  137: "https://rpc-mumbai.matic.today",
  42161: "https://arb1.arbitrum.io/rpc",
  1285: "https://rpc.moonriver.moonbeam.network",
  25: "https://evm-cronos.crypto.org",
  1313161554: "https://mainnet.aurora.dev",
};

export const injected = new InjectedConnector({
  supportedChainIds: chains,
});

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions }),
);

export const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpc: Object.keys(RPC_URLS).reduce((acc, chainId) => {
          const url = RPC_URLS[+chainId as keyof typeof RPC_URLS];
          return { ...acc, [chainId]: url };
        }, {}),
      },
    }),
);

export const [coinbaseWallet, coinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: RPC_URLS[1],
      },
    }),
);

export function getHooks(connector: Connector): Web3ReactHooks | undefined {
  if (connector instanceof CoinbaseWallet) return coinbaseWalletHooks;
  if (connector instanceof MetaMask) return metaMaskHooks;
  if (connector instanceof WalletConnect) return walletConnectHooks;
}

export const connectorsAndHooks: [Connector, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
];

export const connectorItemPropsList = [
  {
    icon: "metamask.svg",
    title: "connection.metamask", // translation string
    connector: metaMask,
    hooks: metaMaskHooks,
  },
  {
    icon: "walletconnect.svg",
    title: "connection.walletConnect", // translation string
    connector: walletConnect,
    hooks: walletConnectHooks,
  },
  {
    icon: "coinbase.svg",
    title: "connection.coinbase", // translation string
    connector: coinbaseWallet,
    hooks: coinbaseWalletHooks,
  },
];
