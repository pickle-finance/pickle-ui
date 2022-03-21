import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { CloverConnector } from "@clover-network/clover-connector";
import { Chains } from "picklefinance-core";
const POLLING_INTERVAL = 12000;
const RPC_URLS = Chains.list()
  .map((x) => {
    const id = Chains.get(x).id;
    const val = Chains.get(x).rpcProviderUrls[0];
    const ret: any = {};
    ret[id] = val;
    return ret;
  })
  .reduce((prev, current) => {
    return { ...prev, ...current };
  });
RPC_URLS[1] = process.env.infura;

export const injected = new InjectedConnector({
  supportedChainIds: Chains.list().map((x) => Chains.get(x).id),
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
