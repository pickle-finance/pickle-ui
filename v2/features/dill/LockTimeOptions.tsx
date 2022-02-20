import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { RadioGroup } from "@headlessui/react";

import { classNames } from "v2/utils";

interface Props {
  showValue?: boolean;
}

const LockTimeOptions: FC<Props> = ({ showValue = false }) => {
  const { t } = useTranslation("common");

  const options = [
    { value: 1 / 4 / 12, unit: t("v2.time.day_plural"), count: 30 },
    { value: 1 / 4, unit: t("v2.time.year_singular"), count: 1 },
    { value: 1 / 2, unit: t("v2.time.year_plural"), count: 2 },
    { value: 1, unit: t("v2.time.year_plural"), count: 4 },
  ];

  const [option, setOption] = useState<number>(0);

  return (
    <RadioGroup value={option} onChange={setOption}>
      <div className="grid grid-cols-4 gap-2">
        {options.map((opt, index) => (
          <RadioGroup.Option
            key={opt.value}
            value={index + 1}
            className={({ checked }) =>
              classNames(
                checked
                  ? "bg-gray-outline border-primary-light"
                  : "bg-background-light border-gray-dark hover:bg-gray-outline",
                "font-title border rounded-xl cursor-pointer text-foreground py-4 px-6 flex items-center justify-center text-sm font-medium",
              )
            }
          >
            <RadioGroup.Label as="div">
              <p>{opt.count}</p>
              <p>{opt.unit}</p>
              {showValue && (
                <p className="mt-4 text-primary">{opt.value.toFixed(4)}</p>
              )}
            </RadioGroup.Label>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
};

export default LockTimeOptions;
