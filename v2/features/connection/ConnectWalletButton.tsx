import { FC } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import { setIsModalOpen } from "v2/store/connection";
import { useAppDispatch } from "v2/store";

const ConnectWalletButton: FC = () => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  const openModal = () => dispatch(setIsModalOpen(true));

  return (
    <Button size="normal" onClick={openModal}>
      {t("v2.connection.connectWallet")}
    </Button>
  );
};

export default ConnectWalletButton;
