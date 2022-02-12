import { FC } from "react";
import { useTranslation } from "next-i18next";

interface OptionProps {
  value: number;
  count: number;
  unit: string;
  showValue: boolean;
}

const Option: FC<OptionProps> = ({ value, unit, count, showValue }) => {
  return (
    <div>
      <p>{count}</p>
      <p>{unit}</p>
      {showValue && <p>{value.toFixed(4)}</p>}
    </div>
  );
};

interface Props {
  showValue?: boolean;
}

const LockTimeOptions: FC<Props> = ({ showValue = false }) => {
  const { t } = useTranslation("common");

  return (
    <div className="flex justify-between">
      <Option
        value={1 / 4 / 12}
        unit={t("v2.time.day_plural")}
        count={30}
        showValue={showValue}
      />
      <Option
        value={1 / 4}
        unit={t("v2.time.year_singular")}
        count={1}
        showValue={showValue}
      />
      <Option
        value={1 / 2}
        unit={t("time.year_plural")}
        count={2}
        showValue={showValue}
      />
      <Option
        value={1}
        unit={t("time.year_plural")}
        count={4}
        showValue={showValue}
      />
    </div>
  );
};

export default LockTimeOptions;
