import { FC } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "next-i18next";
import { RadioGroup } from "@headlessui/react";
import { SunIcon, MoonIcon, SparklesIcon } from "@heroicons/react/solid";

import Button from "v2/components/Button";
import Modal from "v2/components/Modal";
import { classNames } from "v2/utils";
import { ThemeType } from "v2/store/theme";
import { ThemeSelectors, setThemeType } from "v2/store/theme";
import { useAppDispatch } from "v2/store";
import ThemeSelect from "./ThemeSelect";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const ThemeModal: FC<Props> = ({ isOpen, closeModal }) => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const theme = useSelector(ThemeSelectors.selectTheme);

  const options = [
    { value: ThemeType.Dark, label: t("v2.theme.dark"), icon: MoonIcon },
    { value: ThemeType.Light, label: t("v2.theme.light"), icon: SunIcon },
    // { value: ThemeType.Rare, label: t("v2.theme.rare"), icon: SparklesIcon },
  ];

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title={t("v2.theme.pick")}>
      <RadioGroup value={theme.type} onChange={(value) => dispatch(setThemeType(value))}>
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => {
            const Icon = opt.icon;

            return (
              <RadioGroup.Option
                key={opt.value}
                value={opt.value}
                className={({ checked }) =>
                  classNames(
                    checked
                      ? "bg-background-lightest border-primary-light"
                      : "bg-background-light border-foreground-alt-500 hover:bg-background-lightest",
                    "font-title border rounded-xl cursor-pointer text-foreground py-4 px-6 flex items-center justify-center text-sm font-medium",
                  )
                }
              >
                {({ checked }) => (
                  <RadioGroup.Label as="div" className="flex flex-col items-center">
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
      {/* {theme.type === ThemeType.Rare && (
        <div className="mt-6">
          <ThemeSelect />
        </div>
      )} */}
      <div className="mt-6">
        <Button onClick={closeModal}>{t("v2.actions.close")}</Button>
      </div>
    </Modal>
  );
};

export default ThemeModal;
