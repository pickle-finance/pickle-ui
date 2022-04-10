import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { RadioGroup } from "@headlessui/react";
import { IUserDillStats } from "picklefinance-core/lib/client/UserModel";
import dayjs, { Dayjs } from "dayjs";

import { classNames } from "v2/utils";
import { getDayOffset } from "./flows/utils";

interface Props {
  showValue?: boolean;
  setLockTime: (date: Date) => void;
  dill?: IUserDillStats | undefined;
}

const LockTimeOptions: FC<Props> = ({ showValue = false, setLockTime, dill }) => {
  const { t } = useTranslation("common");
  const lockEnd: Dayjs | undefined = dill?.lockEnd
    ? dayjs.unix(parseFloat(dill?.lockEnd))
    : undefined;

  const options = [
    { value: 1 / 4 / 12, unit: t("v2.time.day_plural"), count: 30, weeks: 4.3 },
    { value: 1 / 4, unit: t("v2.time.year_singular"), count: 1, weeks: 52.1429 },
    { value: 1 / 2, unit: t("v2.time.year_plural"), count: 2, weeks: 104.2858 },
    { value: 1, unit: t("v2.time.year_plural"), count: 4, weeks: 208.5716 },
  ];

  const [option, setOption] = useState<number>(4);

  const onRadioChange = (opt: number) => {
    setOption(opt);
    setLockTime(getDayOffset(new Date(), options[opt - 1].weeks * 7));
  };

  return (
    <RadioGroup value={option} onChange={onRadioChange}>
      <div className="grid grid-cols-4 gap-2">
        {options.map((opt, index) => (
          <RadioGroup.Option
            key={opt.weeks}
            value={index + 1}
            disabled={lockEnd?.isAfter(dayjs().add(opt.weeks, "week"))}
            className={({ checked, disabled }) =>
              classNames(
                checked
                  ? "bg-background-lightest border-primary-light"
                  : "bg-background-light border-foreground-alt-500 hover:bg-background-lightest",
                disabled ? "text-foreground-alt-400" : "text-foreground",
                "font-title border rounded-xl cursor-pointer py-4 px-6 flex items-center justify-center text-sm font-medium",
              )
            }
          >
            <RadioGroup.Label as="div">
              <p>{opt.count}</p>
              <p>{opt.unit}</p>
              {showValue && <p className="mt-4 text-primary">{opt.value.toFixed(4)}</p>}
            </RadioGroup.Label>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
};

export default LockTimeOptions;
