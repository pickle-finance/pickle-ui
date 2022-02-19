import { FC } from "react";
import { useTranslation } from "next-i18next";

import Modal from "v2/components/Modal";
import {
  Connectors,
  Connector,
  injected,
  walletconnect,
  walletlink,
} from "./connectors";
import ConnectorItem from "./ConnectorItem";
import coinbase from "public/wallet/coinbase.svg";
import metamask from "public/wallet/metamask.svg";
import walletConnect from "public/wallet/walletconnect.svg";

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
          <ConnectorItem key={connector.title} connector={connector} />
        ))}
      </div>
    </Modal>
  );
};

export default ConnectWalletModal;
