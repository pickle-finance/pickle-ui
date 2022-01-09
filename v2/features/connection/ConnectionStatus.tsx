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
import { networks } from "./networks";
import { resetWalletConnectState } from "./utils";

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

const ErrorMessage: FC<{ error: Error | undefined }> = ({ error }) => {
  const { t } = useTranslation("common");
  const { activate, connector } = useWeb3React<Web3Provider>();

  resetWalletConnectState(connector);

  if (error instanceof UnsupportedChainIdError) {
    return (
      <>
        <p>{t("v2.connection.unsupportedNetwork")}</p>
        <div className="mt-4">
          {networks.map((network) => (
            <a
              key={network.name}
              href="#"
              className="inline-flex group justify-between items-center bg-black p-2 rounded-lg mr-2"
            >
              <div className="flex">
                <div className="w-5 h-5 mr-3">
                  <Image
                    src={network.icon}
                    width={200}
                    height={200}
                    layout="responsive"
                    alt={network.name}
                    title={network.name}
                    className="rounded-full"
                    priority
                  />
                </div>
                <span className="text-white group-hover:text-green-light text-sm font-bold pr-4 transition duration-300 ease-in-out">
                  {network.name}
                </span>
              </div>
            </a>
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
  const { error } = useWeb3React<Web3Provider>();

  if (!isRelevantError(error)) return null;

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
