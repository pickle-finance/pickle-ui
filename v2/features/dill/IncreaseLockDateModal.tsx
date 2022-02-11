import { FC } from "react";
import { useTranslation } from "next-i18next";
import Button from "v2/components/Button";
import Modal from "v2/components/Modal";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const TabsTimePicker: FC<TabsTimePickerProps> = ({ text, variant }) => {
  return (
    <div
      className="box-border w-20 h-20 flex flex-col justify-center items-center p-4 bg-gray-900 overflow-visible"
      style={{ borderRadius: "10px", border: "1px solid #1f2d30" }}
    >
      <p className="w-auto h-auto flex-shrink-0 overflow-visible font-medium not-italic text-white text-base tracking-normal text-center mb-4">
        {text}
      </p>
    </div>
  );
};

const IncreaseLockDateModal: FC<Props> = ({ isOpen, closeModal }) => {
  const { t } = useTranslation("common");

  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      title={t("dill.increaseLockAmount")}
    >
      <section className="mb-8 flex justify-between">
        <TabsTimePicker
          text={`30 ${t("time.day_plural")}`}
          variant="Selected"
        />
        <TabsTimePicker text={`${t("time.year")}`} variant="Default" />
        <TabsTimePicker text={`2 ${t("time.year_plural")}`} variant="Default" />
        <TabsTimePicker text={`4 ${t("time.year_plural")}`} variant="Default" />
      </section>
      <section>
        <Button>{t("dill.buttonConfirm")}</Button>
      </section>
    </Modal>
  );
};

interface TabsTimePickerProps {
  text: string;
  variant: "Selected" | "Default";
}

export default IncreaseLockDateModal;
