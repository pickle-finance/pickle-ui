import { FC } from "react";
import { useTranslation } from "next-i18next";
import Button from "v2/components/Button";
import Modal from "v2/components/Modal";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const TabsTimePicker: FC<TabsTimePickerProps> = ({ number, text, variant }) => {
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
    <Modal isOpen={isOpen} closeModal={closeModal} title="Get DILL">
      <section className="w-full bg-gray-900 overflow-visible mb-4">
        <aside className="flex justify-between p-3">
          <p className="whitespace-pre font-bold not-italic text-gray-600 text-xs tracking-normal leading-3">
            {t("dill.totalDillAmount")}
          </p>
          <p className="whitespace-pre font-bold not-italic text-gray-600 text-xs tracking-normal leading-3">
            {t("dill.pickleBalance")}: 41.897
          </p>
        </aside>

        <aside className="flex justify-between p-3 h-12 pt-0">
          <input
            type="text"
            className="bg-transparent focus:outline-none w-4/5 h-auto flex-shrink-0 overflow-visible whitespace-pre font-medium not-italic text-green-500 text-base tracking-normal leading-5"
          />
          <Button>{t("balances.max")}</Button>
        </aside>
      </section>
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
