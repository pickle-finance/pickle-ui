import { FC } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import LockTimeOptions from "./LockTimeOptions";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  pickleBalance: number;
}

const GetDillModal: FC<Props> = ({ isOpen, closeModal, pickleBalance }) => {
  const { t } = useTranslation("common");

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title={t("v2.dill.getDill")}>
      <div className="bg-background-lightest rounded-xl px-4 py-2">
        <div className="flex justify-between mb-2">
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.dill.amount")}
          </p>
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.dill.pickleBalance")}: {pickleBalance}
          </p>
        </div>

        <div className="flex justify-between">
          <input
            type="number"
            className="w-3/5 bg-transparent focus:outline-none flex-shrink-0 font-medium text-primary leading-7"
          />
          <Button size="small">{t("v2.balances.max")}</Button>
        </div>
      </div>
      <div className="my-6">
        <LockTimeOptions showValue />
      </div>
      <Button>{t("v2.actions.confirm")}</Button>
    </Modal>
  );
};

export default GetDillModal;
