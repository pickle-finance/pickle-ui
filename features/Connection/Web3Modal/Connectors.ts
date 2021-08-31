import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  1: process.env.infura,
  137: "https://polygon-rpc.com",
};

export const injected = new InjectedConnector({
  supportedChainIds: [1, 137],
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
