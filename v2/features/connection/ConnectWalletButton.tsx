import { FC, useState } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import ConnectWalletModal from "./ConnectWalletModal";

const ConnectWalletButton: FC = () => {
  const { t } = useTranslation("common");
  let [isOpen, setIsOpen] = useState<boolean>(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <Button size="normal" onClick={openModal}>
        {t("v2.connection.connectWallet")}
      </Button>
      <ConnectWalletModal isOpen={isOpen} closeModal={closeModal} />
    </>
  );
};

export default ConnectWalletButton;
