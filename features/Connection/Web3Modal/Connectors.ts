import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { CloverConnector } from "@clover-network/clover-connector";
import { Chains } from "picklefinance-core";

import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import type { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { hooks as metaMaskHooks, metaMask } from './MetaMaskConnectorItem'
import { hooks as walletConnectHooks, walletConnect } from './WalletConnectConnectorItem'


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
export {metaMask,walletConnect};



function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  // if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  // if (connector instanceof Network) return 'Network'
  return 'Unknown'
}

export function getHooks(connector: Connector): Web3ReactHooks|undefined {
  if (connector instanceof MetaMask) return metaMaskHooks
  if (connector instanceof WalletConnect) return walletConnectHooks
}

export const connectors: [MetaMask | WalletConnect /* | CoinbaseWallet | Network */, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  // [coinbaseWallet, coinbaseWalletHooks],
  // [network, networkHooks],
]

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
