import { FC } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useWeb3React } from "@web3-react/core";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { NoEthereumProviderError } from "@web3-react/injected-connector";
import type { Web3Provider } from "@ethersproject/providers";

import Modal from "v2/components/Modal";
import { Connectors, injected, walletconnect, walletlink } from "./connectors";
import coinbase from "public/wallet/coinbase.svg";
import metamask from "public/wallet/metamask.svg";
import walletConnect from "public/wallet/walletconnect.svg";
import { classNames } from "v2/utils";

interface Connector {
  id: Connectors;
  icon: any;
  title: string;
  connector: AbstractConnector;
}

interface ConnectorProps {
  connector: Connector;
}

const Connector: FC<ConnectorProps> = ({ connector }) => {
  const { error } = useWeb3React<Web3Provider>();

  const disabled =
    connector.id === Connectors.Metamask &&
    error instanceof NoEthereumProviderError;

  return (
    <a
      href="#"
      aria-disabled={disabled}
      className={classNames(
        "flex group outline-none bg-black-lighter rounded-xl py-4 px-6 hover:bg-gray-dark transition-colors duration-300 ease-in-out",
        disabled && "filter grayscale cursor-not-allowed",
      )}
    >
      <div className="w-12 p-1 bg-gray-outline rounded-full mr-4">
        <Image
          src={connector.icon}
          width={200}
          height={200}
          layout="responsive"
          className="rounded-full"
          alt={connector.title}
          title={connector.title}
        />
      </div>
      <div className="flex flex-col text-left justify-center">
        <p className="text-white text-xl group-hover:text-green-light transition-colors duration-300 ease-in-out">
          {connector.title}
        </p>
      </div>
    </a>
  );
};

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const ConnectWalletModal: FC<Props> = ({ isOpen, closeModal }) => {
  const { t } = useTranslation("common");

  const connectors: Connector[] = [
    {
      id: Connectors.Metamask,
      icon: metamask,
      title: t("v2.connection.metamask"),
      connector: injected,
    },
    {
      id: Connectors.WalletConnect,
      icon: walletConnect,
      title: t("v2.connection.walletConnect"),
      connector: walletconnect,
    },
    {
      id: Connectors.Coinbase,
      icon: coinbase,
      title: t("v2.connection.coinbase"),
      connector: walletlink,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      title={t("v2.connection.connectWallet")}
    >
      <div className="grid gap-2">
        {connectors.map((connector) => (
          <Connector key={connector.title} connector={connector} />
        ))}
      </div>
    </Modal>
  );
};

export default ConnectWalletModal;
