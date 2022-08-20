import { CloverConnector } from "@clover-network/clover-connector";
import { UAuthConnector } from "@uauth/web3-react";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import chains from "./chainIds.json";

export interface Connector {
  id: Connectors;
  icon: any;
  title: string;
  connector: AbstractConnector;
}

export enum Connectors {
  Metamask,
  WalletConnect,
  Coinbase,
  Clover,
  Unstoppable,
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

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] /*, 137: RPC_URLS[137]*/ }, // web3-react walletconnect connector not compatible
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: "Pickle Finance",
  appLogoUrl: "pickle.png",
});

export const cloverconnect = new CloverConnector({
  supportedChainIds: [1],
});

export const uauthconnect = new UAuthConnector({
  clientID: process.env.NEXT_PUBLIC_UAUTH_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_UAUTH_REDIRECT_URI,
  scope: "openid wallet",
  connectors: { injected, walletconnect },
});
