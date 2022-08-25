import { RadioGroup } from "@headlessui/react";
import { useTranslation } from "next-i18next";
import { FC } from "react";
import { classNames } from "v2/utils";

const SortToggle: FC<ToggleProps> = ({ txSort, setTxSort }) => {
  const { t } = useTranslation("common");

  return (
    <RadioGroup value={txSort} onChange={setTxSort} className="pt-4">
      <div className="flex h-4">
        <RadioGroup.Option
          key="old"
          value="old"
          className={({ checked }) =>
            classNames(
              checked ? "bg-accent" : "bg-background-light hover:bg-background-lightest",
              "border-y border-l border-accent font-title rounded-l-full cursor-pointer text-foreground py-3 px-6 flex items-center justify-center text-sm font-medium",
            )
          }
        >
          <RadioGroup.Label as="div">
            <p>{t("Old")}</p>
          </RadioGroup.Label>
        </RadioGroup.Option>

        <RadioGroup.Option
          key="new"
          value="new"
          className={({ checked }) =>
            classNames(
              checked ? "bg-accent" : "bg-background-light hover:bg-background-lightest",
              "border-y border-r border-accent font-title rounded-r-full cursor-pointer text-foreground py-3 px-6 flex items-center justify-center text-sm font-medium",
            )
          }
        >
          <RadioGroup.Label as="div">
            <p>{t("New")}</p>
          </RadioGroup.Label>
        </RadioGroup.Option>
      </div>
    </RadioGroup>
  );
};

interface ToggleProps {
  txSort: string;
  setTxSort: React.Dispatch<React.SetStateAction<any>>;
}

export default SortToggle;
