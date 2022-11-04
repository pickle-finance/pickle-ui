import { InjectedConnector } from "@web3-react/injected-connector";
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

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: "Pickle Finance",
  appLogoUrl: "pickle.png",
});

export const cloverconnect = new CloverConnector({
  supportedChainIds: [1],
});
