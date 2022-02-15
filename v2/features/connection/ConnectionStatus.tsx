import { FC } from "react";
import Image from "next/image";
import { Trans, useTranslation } from "next-i18next";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import type { Web3Provider } from "@ethersproject/providers";
import { UserRejectedRequestError as UserRejectedRequestErrorInjected } from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";
import { FireIcon } from "@heroicons/react/solid";

import Link from "v2/components/Link";
import { injected } from "v2/features/connection/connectors";
import { resetWalletConnectState } from "./utils";
import { PickleModelJson } from "picklefinance-core";
import { RawChain, Chains } from "picklefinance-core/lib/chain/Chains";
import { useSelector } from "react-redux";
import { CoreSelectors } from "v2/store/core";
import { getNetworks, Network } from "./networks";

const isRelevantError = (error: Error | undefined): boolean => {
  if (
    error instanceof UnsupportedChainIdError ||
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return true;
  }

  return false;
};

const chainToChainParams = (chain: RawChain | undefined) => {
  if (!chain) return undefined;
  return {
    chainId: "0x" + chain.chainId.toString(16),
    chainName: chain.networkVisible,
    nativeCurrency: {
      name: chain.gasToken.toUpperCase(),
      symbol: chain.gasToken.toUpperCase(),
      decimals: 18,
    },
    rpcUrls: chain.rpcs,
    blockExplorerUrls: [chain.explorer],
  };
};

export const switchChain = async (
  library: Web3Provider | undefined,
  chainId: number,
  pfcore: PickleModelJson.PickleModelJson | undefined,
): Promise<boolean> => {
  if (
    pfcore &&
    library &&
    library.provider !== undefined &&
    library.provider.request !== undefined
  ) {
    let method: string;
    let params: any[];
    if (chainId === 1) {
      method = "wallet_switchEthereumChain";
      params = [{ chainId: "0x1" }];
    } else {
      method = "wallet_addEthereumChain";
      const param = chainToChainParams(
        pfcore.chains.find((x) => x.chainId === chainId),
      );
      if (param === undefined || param === null) return false;
      params = [param];
    }
    try {
      await library.provider.request({
        method: method,
        params: params,
      });
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
};

const ErrorMessage: FC<{ error: Error | undefined }> = ({ error }) => {
  const { t } = useTranslation("common");
  const { activate, connector, library } = useWeb3React<Web3Provider>();
  const allCore = useSelector(CoreSelectors.selectCore);
  const networks = useSelector(CoreSelectors.selectNetworks);

  resetWalletConnectState(connector);

  if (error instanceof UnsupportedChainIdError) {
    return (
      <>
        <p>{t("v2.connection.unsupportedNetwork")}</p>
        <div className="mt-4">
          {networks?.map((network) => (
            <div
              key={network.name}
              className="inline-flex group justify-between items-center bg-black p-2 rounded-lg mr-2"
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
                className="text-color-base cursor-pointer group-hover:text-primary-light text-sm font-bold pr-4 transition duration-300 ease-in-out"
                onClick={() => switchChain(library, network.chainId, allCore)}
              >
                {network.visibleName}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return (
      <Trans i18nKey="v2.connection.unauthorized">
        Please
        <Link
          href="#"
          className="text-lg"
          onClick={() => activate(connector || injected)}
          primary
        >
          authorize
        </Link>
        Pickle Finance to access your Ethereum account.
      </Trans>
    );
  }

  return null;
};

const ConnectionStatus: FC = () => {
  const { t } = useTranslation("common");
  let { error, chainId } = useWeb3React<Web3Provider>();
  const supportedChains: number[] = Chains.list().map((x) => Chains.get(x).id);

  if (!chainId) return null;
  if (!isRelevantError(error) && chainId && supportedChains.includes(chainId))
    return null;
  if (!error && !(chainId && supportedChains.includes(chainId))) {
    // App will function with all known chains
    // supportedChains contains all chains Pickle supports
    // we want error if chainId is not in supportedChains
    error = new UnsupportedChainIdError(
      chainId ? chainId : -1,
      supportedChains,
    );
  } else return null;
  return (
    <div className="bg-black-lighter px-6 py-4 sm:px-8 sm:py-6 mb-6 rounded-2xl border border-gray-dark">
      <div className="flex font-title mb-2 text-lg items-center">
        <FireIcon className="text-orange w-5 h-5 mr-2" />
        {t("v2.connection.errorTitle")}
      </div>
      <div className="text-gray-light">
        <ErrorMessage error={error} />
      </div>
    </div>
  );
};

export default ConnectionStatus;
