import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { RadioGroup } from "@headlessui/react";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { classNames } from "v2/utils";
import { SunIcon, MoonIcon, SparklesIcon } from "@heroicons/react/solid";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

enum ThemeType {
  Light,
  Dark,
  Rare,
}

const ThemeModal: FC<Props> = ({ isOpen, closeModal }) => {
  const { t } = useTranslation("common");
  const [option, setOption] = useState<number>(ThemeType.Dark);

  const options = [
    { value: ThemeType.Dark, label: t("v2.theme.dark"), icon: MoonIcon },
    { value: ThemeType.Light, label: t("v2.theme.light"), icon: SunIcon },
    { value: ThemeType.Rare, label: t("v2.theme.rare"), icon: SparklesIcon },
  ];

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title={t("v2.theme.pick")}>
      <RadioGroup value={option} onChange={setOption}>
        <div className="grid grid-cols-3 gap-2">
          {options.map((opt) => {
            const Icon = opt.icon;

            return (
              <RadioGroup.Option
                key={opt.value}
                value={opt.value}
                className={({ checked }) =>
                  classNames(
                    checked
                      ? "bg-gray-outline border-primary-light"
                      : "bg-black-light border-gray-dark hover:bg-gray-outline",
                    "font-title border rounded-xl cursor-pointer text-foreground py-4 px-6 flex items-center justify-center text-sm font-medium",
                  )
                }
              >
                {({ checked }) => (
                  <RadioGroup.Label
                    as="div"
                    className="flex flex-col items-center"
                  >
                    <Icon
                      className={classNames(
                        checked ? "fill-primary-light" : "fill-current",
                        "h-5 w-5 mb-3",
                      )}
                    />
                    <span>{opt.label}</span>
                  </RadioGroup.Label>
                )}
              </RadioGroup.Option>
            );
          })}
        </div>
      </RadioGroup>
      <div className="mt-6">
        <Button onClick={closeModal}>{t("v2.actions.close")}</Button>
      </div>
    </Modal>
  );
};

export default ThemeModal;
