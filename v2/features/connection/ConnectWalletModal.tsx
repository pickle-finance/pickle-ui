import { FC } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import Modal from "v2/components/Modal";
import {
  Connectors,
  Connector,
  injected,
  walletconnect,
  walletlink,
  cloverconnect,
} from "./connectors";
import ConnectorItem from "./ConnectorItem";
import coinbase from "public/wallet/coinbase.svg";
import metamask from "public/wallet/metamask.svg";
import clvWallet from "public/wallet/clv.jpeg";
import walletConnect from "public/wallet/walletconnect.svg";
import { ConnectionSelectors, setIsModalOpen } from "v2/store/connection";
import { useAppDispatch } from "v2/store";

const ConnectWalletModal: FC = () => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const isOpen = useSelector(ConnectionSelectors.selectIsModalOpen);

  const closeModal = () => dispatch(setIsModalOpen(false));

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
    {
      id: Connectors.Clover,
      icon: clvWallet,
      title: t("v2.connection.clvWallet"),
      connector: cloverconnect,
    },
  ];

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title={t("v2.connection.connectWallet")}>
      <div className="grid gap-2">
        {connectors.map((connector) => (
          <ConnectorItem key={connector.title} connector={connector} />
        ))}
      </div>
    </Modal>
  );
};

export default ConnectWalletModal;
