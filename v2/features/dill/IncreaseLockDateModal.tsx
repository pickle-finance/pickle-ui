import { FC } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import LockTimeOptions from "./LockTimeOptions";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const IncreaseLockDateModal: FC<Props> = ({ isOpen, closeModal }) => {
  const { t } = useTranslation("common");

  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      title={t("v2.dill.increaseLockDate")}
    >
      <div className="mb-6">
        <LockTimeOptions />
      </div>
      <Button>{t("v2.actions.confirm")}</Button>
    </Modal>
  );
};

export default IncreaseLockDateModal;
