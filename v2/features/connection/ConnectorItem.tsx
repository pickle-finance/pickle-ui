import { FC, useState } from "react";
import Image from "next/image";
import { useWeb3React, Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";

import { NoEthereumProviderError } from "@web3-react/injected-connector";
import type { Web3Provider } from "@ethersproject/providers";

import { useAppDispatch, useAppSelector } from "v2/store";
import { ConnectionSelectors, setIsModalOpen, updateConnectionError } from "v2/store/connection";
import { ConnectionType, getConnection } from "./connectors";
import { classNames } from "v2/utils";
import Spinner from "v2/components/Spinner";
import walletConnect from "public/wallet/walletconnect.svg";

import { resetWalletConnectState } from "./utils";
import { useTranslation } from "next-i18next";
import { connect } from "http2";

interface Props {
  icon: string;
  title: string;
  connector: Connector;
  hooks: Web3ReactHooks;
}

interface ConnectorItemIconProps extends Props {
  isLoading: boolean;
}

const ConnectorItemIcon: FC<ConnectorItemIconProps> = ({ icon, title, isLoading }) => (
  <div className="relative w-12 h-12 p-1 bg-foreground-alt-400 rounded-full mr-4">
    <Image
      src={icon}
      width={200}
      height={200}
      layout="responsive"
      className={classNames(
        "rounded-full transition-opacity duration-200 ease-linear",
        isLoading && "filter grayscale opacity-40",
      )}
      alt={title}
      title={title}
    />
    {/* This is centered given the absolute width of the wrapping div */}
    {isLoading && <Spinner className="absolute top-2 left-2 w-8 h-8" />}
  </div>
);

const ConnectorItem: FC<Props> = (props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation("common");

  const { title, connector, hooks, icon } = props;
  const { useIsActivating, useIsActive } = hooks;
  const connectorId = getConnection(connector)?.id;
  const error = useAppSelector((state) => ConnectionSelectors.selectError(state, connectorId));

  const disabled = connectorId === ConnectionType.Metamask && error;

  const localizedTitle = t(title); // localize the title

  const handleClick = async () => {
    if (disabled) return;
    dispatch(updateConnectionError({ connectionType: connectorId, error: undefined }));

    setIsLoading(true);
    try {
      await connector.activate();
      dispatch(setIsModalOpen(false));
    } catch (e) {
      dispatch(updateConnectionError({ connectionType: connectorId, error: (e as Error).message }));
    }
  };

  return (
    <a
      href="#"
      onClick={async () => await handleClick()}
      aria-disabled={disabled}
      className={classNames(
        "flex group outline-none bg-background-lightest rounded-xl py-4 px-6 hover:bg-foreground-alt-500 transition-colors duration-300 ease-in-out",
        disabled && "filter grayscale cursor-not-allowed",
      )}
    >
      <ConnectorItemIcon {...props} isLoading={isLoading} />
      <div className="flex flex-col text-left justify-center">
        <p className="text-foreground text-xl group-hover:text-primary-light transition-colors duration-300 ease-in-out">
          {localizedTitle}
        </p>
      </div>
    </a>
  );
};

export default ConnectorItem;
