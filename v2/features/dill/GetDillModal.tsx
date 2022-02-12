import { FC } from "react";
import { useTranslation } from "next-i18next";
import Button from "v2/components/Button";
import Modal from "v2/components/Modal";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const TabsTimePicker: FC<TabsTimePickerProps> = ({ number, text }) => {
  return (
    <div className="tabsTimePicker">
      <p className="tabsTimePicker__text">{text}</p>
      <p className="tabsTimePicker__number">{number}</p>
    </div>
  );
};

const GetDillModal: FC<Props> = ({ isOpen, closeModal }) => {
  const { t } = useTranslation("common");

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title={t("v2.dill.getDill")}>
      <div className="bg-black-lighter mb-4 rounded-xl px-4 py-2">
        <div className="flex justify-between mb-2">
          <p className="font-bold text-gray-outline-light text-xs tracking-normal leading-4">
            {t("v2.dill.amount")}
          </p>
          <p className="font-bold text-gray-outline-light text-xs tracking-normal leading-4">
            {t("v2.dill.pickleBalance")}: 41.897
          </p>
        </div>

        <div className="flex justify-between">
          <input
            type="text"
            className="w-3/5 bg-transparent focus:outline-none flex-shrink-0 font-medium text-green leading-7"
          />
          <Button size="small">{t("balances.max")}</Button>
        </div>
      </div>
      <section className="flex justify-between">
        <TabsTimePicker
          number="0.0206"
          text={`30 ${t("time.day_plural")}`}
          variant="Selected"
        />
        <TabsTimePicker
          number="0.2401"
          text={`${t("time.year")}`}
          variant="Default"
        />
        <TabsTimePicker
          number="0.5002"
          text={`2 ${t("time.year_plural")}`}
          variant="Default"
        />
        <TabsTimePicker
          number="0.9987"
          text={`4 ${t("time.year_plural")}`}
          variant="Default"
        />
      </section>
      <section style={{ marginTop: "2rem" }}>
        <Button>Confirm</Button>
      </section>
    </Modal>
  );
};

interface TabsTimePickerProps {
  number: string;
  text: string;
  variant: "Selected" | "Default";
}

export default GetDillModal;
