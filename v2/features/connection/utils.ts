import { AbstractConnector } from "@web3-react/abstract-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

// Manually reset WalletConnect connector if the user previously closed the
// connection modal. See:
// https://github.com/Uniswap/interface/blob/8975086a691ccac35fc76af21e3b2e6f39469fe5/src/components/WalletModal/index.tsx#L183-L186
export const resetWalletConnectState = (connector: AbstractConnector | undefined) => {
  if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
    connector.walletConnectProvider = undefined;
  }
};
