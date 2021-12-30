import { FC } from "react";
import { Trans, useTranslation } from "next-i18next";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import type { Web3Provider } from "@ethersproject/providers";
import { UserRejectedRequestError as UserRejectedRequestErrorInjected } from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";
import { FireIcon } from "@heroicons/react/solid";

import Link from "v2/components/Link";
import { injected } from "v2/features/connection/connectors";

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
  const { activate } = useWeb3React<Web3Provider>();

  if (error instanceof UnsupportedChainIdError) {
    return <span>{t("v2.connection.unsupportedNetwork")}</span>;
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
          onClick={() => activate(injected)}
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
      <p className="text-gray-light">
        <ErrorMessage error={error} />
      </p>
    </div>
  );
};

export default ConnectionStatus;
