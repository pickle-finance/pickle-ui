import type { Web3Provider } from "@ethersproject/providers";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { NoEthereumProviderError } from "@web3-react/injected-connector";
import Image from "next/image";
import { FC, useState } from "react";

import Spinner from "v2/components/Spinner";
import { useAppDispatch } from "v2/store";
import { setIsModalOpen } from "v2/store/connection";
import { classNames } from "v2/utils";
import { Connector, Connectors } from "./connectors";
import { resetWalletConnectState } from "./utils";

interface Props {
  connector: Connector;
}

interface ConnectorItemIconProps extends Props {
  isLoading: boolean;
}

const ConnectorItemIcon: FC<ConnectorItemIconProps> = ({ connector, isLoading }) => (
  <div className="relative w-12 h-12 p-1 mr-4 rounded-full bg-foreground-alt-400">
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
    {isLoading && <Spinner className="absolute w-8 h-8 top-2 left-2" />}
  </div>
);

const ConnectorItem: FC<Props> = ({ connector }) => {
  const { error, activate } = useWeb3React<Web3Provider>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const isUAuth = connector.id === Connectors.Unstoppable;

  const disabled =
    connector.id === Connectors.Metamask &&
    (error instanceof NoEthereumProviderError || error instanceof UnsupportedChainIdError);

  resetWalletConnectState(connector.connector);

  const handleClick = () => {
    if (disabled) return;

    setIsLoading(true);
    activate(connector.connector).finally(() => dispatch(setIsModalOpen(false)));
  };

  if (isUAuth)
    return (
      <a href="#" onClick={handleClick} aria-disabled={disabled}>
        <div className="flex items-center justify-center gap-1  bg-[#0d67fe] w-full px-12 text-white rounded-md hover:bg-[#0546b7] active:bg-[#478bfe] hover:cursor-pointer py-1">
          <Image
            src={connector.icon}
            width={48}
            height={48}
            alt={connector.title}
            title={connector.title}
          />
          <p>Login with Unstoppable</p>
        </div>
      </a>
    );

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
      <div className="flex flex-col justify-center text-left">
        <p className="text-xl transition-colors duration-300 ease-in-out text-foreground group-hover:text-primary-light">
          {connector.title}
        </p>
      </div>
    </a>
  );
};

export default ConnectorItem;
