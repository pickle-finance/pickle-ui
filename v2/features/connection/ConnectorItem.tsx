import { FC, useState } from "react";
import Image from "next/image";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { NoEthereumProviderError } from "@web3-react/injected-connector";
import type { Web3Provider } from "@ethersproject/providers";

import { useAppDispatch } from "v2/store";
import { setIsModalOpen } from "v2/store/connection";
import { Connectors, Connector } from "./connectors";
import { classNames } from "v2/utils";
import Spinner from "v2/components/Spinner";
import { resetWalletConnectState } from "./utils";

interface Props {
  connector: Connector;
}

interface ConnectorItemIconProps extends Props {
  isLoading: boolean;
}

const ConnectorItemIcon: FC<ConnectorItemIconProps> = ({ connector, isLoading }) => (
  <div className="relative w-12 h-12 p-1 bg-foreground-alt-400 rounded-full mr-4">
    <Image
      src={connector.icon}
      width={200}
      height={200}
      layout="responsive"
      className={classNames(
        "rounded-full transition-opacity duration-200 ease-linear",
        isLoading && "filter grayscale opacity-40",
      )}
      alt={connector.title}
      title={connector.title}
    />
    {/* This is centered given the absolute width of the wrapping div */}
    {isLoading && <Spinner className="absolute top-2 left-2 w-8 h-8" />}
  </div>
);

const ConnectorItem: FC<Props> = ({ connector }) => {
  const { error, activate } = useWeb3React<Web3Provider>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const disabled =
    connector.id === Connectors.Metamask &&
    (error instanceof NoEthereumProviderError || error instanceof UnsupportedChainIdError);

  resetWalletConnectState(connector.connector);

  const handleClick = () => {
    if (disabled) return;

    setIsLoading(true);
    activate(connector.connector).finally(() => dispatch(setIsModalOpen(false)));
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      aria-disabled={disabled}
      className={classNames(
        "flex group outline-none bg-background-lightest rounded-xl py-4 px-6 hover:bg-foreground-alt-500 transition-colors duration-300 ease-in-out",
        disabled && "filter grayscale cursor-not-allowed",
      )}
    >
      <ConnectorItemIcon connector={connector} isLoading={isLoading} />
      <div className="flex flex-col text-left justify-center">
        <p className="text-foreground text-xl group-hover:text-primary-light transition-colors duration-300 ease-in-out">
          {connector.title}
        </p>
      </div>
    </a>
  );
};

export default ConnectorItem;
