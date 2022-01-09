import { FC } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import ConnectWalletModal from "./ConnectWalletModal";
import { ConnectionSelectors, setIsModalOpen } from "v2/store/connection";
import { useAppDispatch } from "v2/store";

const ConnectWalletButton: FC = () => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const isModalOpen = useSelector(ConnectionSelectors.selectIsModalOpen);

  const openModal = () => dispatch(setIsModalOpen(true));
  const closeModal = () => dispatch(setIsModalOpen(false));

  return (
    <>
      <Button size="normal" onClick={openModal}>
        {t("v2.connection.connectWallet")}
      </Button>
      <ConnectWalletModal isOpen={isModalOpen} closeModal={closeModal} />
    </>
  );
};

export default ConnectWalletButton;
