import { FC } from "react";
import Image from "next/image";
import { Trans, useTranslation } from "next-i18next";
import { useWeb3React } from "@web3-react/core";

import type { Web3Provider } from "@ethersproject/providers";
import { UserRejectedRequestError as UserRejectedRequestErrorInjected } from "@web3-react/injected-connector";
import { FireIcon } from "@heroicons/react/solid";

import { AddEthereumChainParameter, Connector } from "@web3-react/types";
import { MetaMask } from "@web3-react/metamask";
import { WalletConnect } from "@web3-react/walletconnect";
import { CoinbaseWallet } from "@web3-react/coinbase-wallet";

import Link from "v2/components/Link";
import { injected } from "v2/features/connection/connectors";
import { resetWalletConnectState } from "./utils";
import { PickleModelJson } from "picklefinance-core";
import { RawChain, Chains } from "picklefinance-core/lib/chain/Chains";
import { useSelector } from "react-redux";
import { CoreSelectors } from "v2/store/core";

const isRelevantError = (error: Error | undefined): boolean => {
  if (error instanceof UserRejectedRequestErrorInjected) {
    return true;
  }

  return false;
};

const chainToChainParams = (chain: RawChain | undefined) => {
  if (!chain) return undefined;
  return {
    chainId: chain.chainId,
    chainName: chain.networkVisible,
    nativeCurrency: {
      name: chain.gasToken.toUpperCase(),
      symbol: chain.gasTokenSymbol.toUpperCase(),
      decimals: 18,
    },
    rpcUrls: chain.rpcs,
    blockExplorerUrls: [chain.explorer],
  };
};

export const switchChain = async (
  connector: Connector | undefined,
  desiredChainId: number,
  currentChainId: number | undefined,
  pfcore: PickleModelJson.PickleModelJson | undefined,
): Promise<boolean> => {
  if (!pfcore || !connector) return false;
  try {
    if (connector instanceof WalletConnect /* || connector instanceof Network */) {
      await connector.activate(desiredChainId === -1 ? undefined : desiredChainId);
    } else {
      await connector.activate(
        desiredChainId === -1
          ? undefined
          : chainToChainParams(pfcore.chains.find((x) => x.chainId === desiredChainId)),
      );
    }
    return true;
  } catch (e) {
    console.log("switchChainError");
    console.log(e);
  }

  return false;
};

const ErrorMessage: FC<{ error: Error | undefined }> = ({ error }) => {
  const { connector, account, chainId } = useWeb3React<Web3Provider>();
  const allCore = useSelector(CoreSelectors.selectCore);
  const networks = useSelector(CoreSelectors.selectNetworks);

  if (error instanceof UserRejectedRequestErrorInjected) {
    return (
      <Trans i18nKey="v2.connection.unauthorized">
        Please
        <Link href="#" className="text-lg" onClick={() => connector.activate()} primary>
          authorize
        </Link>
        Pickle Finance to access your Ethereum account.
      </Trans>
    );
  }
  return (
    <>
      <div className="mt-4">
        {networks?.map((network) => (
          <div
            key={network.name}
            className="inline-flex group justify-between items-center bg-background p-2 rounded-lg mr-2 mb-2"
          >
            <div className="w-5 h-5 mr-3">
              <Image
                src={`/networks/${network.name}.png`}
                width={200}
                height={200}
                layout="responsive"
                alt={network.name}
                title={network.name}
                className="rounded-full"
                priority
              />
            </div>
            <span
              className="text-foreground cursor-pointer group-hover:text-primary-light text-sm font-bold pr-4 transition duration-300 ease-in-out"
              onClick={() => switchChain(connector, network.chainId, chainId, allCore)}
            >
              {network.visibleName}
            </span>
          </div>
        ))}
      </div>
    </>
  );

  return null;
};

const ConnectionStatus: FC = () => {
  const { t } = useTranslation("common");
  let { error, chainId } = useWeb3React<Web3Provider>();
  const supportedChains: number[] = Chains.list().map((x) => Chains.get(x).id);

  if (!isRelevantError(error) && chainId && supportedChains.includes(chainId)) return null;
  if (!error && !(chainId && supportedChains.includes(chainId))) {
    // App will function with all known chains
    // supportedChains contains all chains Pickle supports
    // we want error if chainId is not in supportedChains
    error = new UnsupportedChainIdError(chainId ? chainId : -1, supportedChains);
  } else if (!chainId) {
    error = undefined;
  } else return null;
  return (
    <div className="bg-background-lightest px-6 py-4 sm:px-8 sm:py-6 mb-6 rounded-2xl border border-foreground-alt-500">
      <div className="flex font-title mb-2 text-lg items-center">
        <FireIcon className="text-accent w-5 h-5 mr-2" />
        {t("v2.connection.errorTitle")}
      </div>
      <div className="text-foreground-alt-200">
        <p>
          {chainId ? t("v2.connection.unsupportedNetwork") : t("v2.connection.disconnectedWallet")}
        </p>
        <ErrorMessage error={error} />
      </div>
    </div>
  );
};

export default ConnectionStatus;
