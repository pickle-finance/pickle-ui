import { Chains } from "picklefinance-core";

import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import type { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'


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

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>((actions) => new MetaMask(actions));

export const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect(actions, {
      rpc: RPC_URLS,
    }),
  Object.keys(RPC_URLS).map((chainId) => Number(chainId)),
);

export const [coinbaseWallet, coinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet(actions, {
      url: RPC_URLS[1][0],
      appName: "Pickle Finance",
      appLogoUrl: "pickle.png",
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
]

export const connectorItemPropsList = [
    {
      icon: "metamask.svg",
      title: "connection.metamask",   // translation string
      connector: metaMask,
      hooks: metaMaskHooks,
    },
    {
      icon: "walletconnect.svg",
      title: "connection.walletConnect",  // translation string
      connector: walletConnect,
      hooks: walletConnectHooks,
    },
    {
      icon: "coinbase.svg",
      title: "connection.coinbase",   // translation string
      connector: coinbaseWallet,
      hooks: coinbaseWalletHooks,
    },
    // {
    //   icon: "clover.svg",
    //   title: t("connection.clover"),
    //   connector: metaMask,
    //   hooks: metaMaskHooks,
    // },
  ];
