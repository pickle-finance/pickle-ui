import { CloverConnector } from "@clover-network/clover-connector";
import { Chains } from "picklefinance-core";

import { initializeConnector, useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import type { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import ConnectorItem from "./ConnectorItem";
import { useTranslation } from "next-i18next";


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

// export const injected = new InjectedConnector({
//   supportedChainIds: Chains.list().map((x) => Chains.get(x).id),
// });

// export const walletconnect = new WalletConnectConnector({
//   rpc: { 1: RPC_URLS[1] /*, 137: RPC_URLS[137]*/ }, // web3-react walletconnect connector not compatible
//   bridge: "https://bridge.walletconnect.org",
//   qrcode: true,
//   pollingInterval: POLLING_INTERVAL,
// });

// export const walletlink = new WalletLinkConnector({
//   url: RPC_URLS[1],
//   appName: "Pickle Finance",
//   appLogoUrl: "pickle.png",
// });

// export const cloverconnect = new CloverConnector({
//   supportedChainIds: [1],
// });

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


function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  // if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  // if (connector instanceof Network) return 'Network'
  return 'Unknown'
}

export function getHooks(connector: Connector): Web3ReactHooks | undefined {
  if (connector instanceof CoinbaseWallet) return coinbaseWalletHooks;
  if (connector instanceof MetaMask) return metaMaskHooks;
  if (connector instanceof WalletConnect) return walletConnectHooks;
}

export const connectorsAndHooks: [Connector, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  // [network, networkHooks],
]

export const connectorItemList = [
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

function Child() {
  const { connector } = useWeb3React()
  console.log(`Priority Connector is: ${getName(connector)}`)
  return null
}

// export default function ProviderExample() {
//   return (
//     <Web3ReactProvider connectors={connectors}>
//       <Child />
//     </Web3ReactProvider>
//   )
// }
