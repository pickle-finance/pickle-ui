import { FC } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import Modal from "v2/components/Modal";
import { connectorItemPropsList } from "./connectors";
import ConnectorItem from "./ConnectorItem";
import { ConnectionSelectors, setIsModalOpen } from "v2/store/connection";
import { useAppDispatch } from "v2/store";

const ConnectWalletModal: FC = () => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const isOpen = useSelector(ConnectionSelectors.selectIsModalOpen);

  const closeModal = () => dispatch(setIsModalOpen(false));

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title={t("v2.connection.connectWallet")}>
      <div className="grid gap-2">
        {connectorItemPropsList.map((c) => (
          <ConnectorItem
            key={c.id}
            title={c.title}
            connector={c.connector}
            hooks={c.hooks}
            icon={c.icon}
          />
        ))}
      </div>
    </Modal>
  );
};

export default ConnectWalletModal;
