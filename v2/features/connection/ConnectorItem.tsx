import { FC, useState } from "react";
import Image from "next/image";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { NoEthereumProviderError } from "@web3-react/injected-connector";
import type { Web3Provider } from "@ethersproject/providers";

import { Connectors, Connector } from "./connectors";
import { classNames } from "v2/utils";
import Spinner from "v2/components/Spinner";

interface Props {
  connector: Connector;
}

interface ConnectorItemIconProps extends Props {
  isLoading: boolean;
}

const ConnectorItemIcon: FC<ConnectorItemIconProps> = ({
  connector,
  isLoading,
}) => (
  <div className="relative w-12 h-12 p-1 bg-gray-outline rounded-full mr-4">
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

  const disabled =
    connector.id === Connectors.Metamask &&
    (error instanceof NoEthereumProviderError ||
      error instanceof UnsupportedChainIdError);

  const handleClick = () => {
    if (disabled) return;

    activate(connector.connector);
    setIsLoading(true);
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      aria-disabled={disabled}
      className={classNames(
        "flex group outline-none bg-black-lighter rounded-xl py-4 px-6 hover:bg-gray-dark transition-colors duration-300 ease-in-out",
        disabled && "filter grayscale cursor-not-allowed",
      )}
    >
      <ConnectorItemIcon connector={connector} isLoading={isLoading} />
      <div className="flex flex-col text-left justify-center">
        <p className="text-white text-xl group-hover:text-green-light transition-colors duration-300 ease-in-out">
          {connector.title}
        </p>
      </div>
    </a>
  );
};

export default ConnectorItem;
