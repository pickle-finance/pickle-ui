import { useTranslation } from "next-i18next";
import { Dispatch, FC, SetStateAction } from "react";
import Select, { StylesConfig } from "react-select";

const ChartSelect: FC<{
  chart: SelectOptions | null;
  setChart: Dispatch<SetStateAction<SelectOptions | null>>;
}> = ({ chart, setChart }) => {
  const chartChange = (chart: SelectOptions): void => {
    setChart(chart);
  };
  const { t } = useTranslation("common");

  const options: SelectOptions[] = [
    {
      label: t("v2.dill.totalRewardsUsd"),
      value: "totalRewardsUsd",
    },
    {
      label: t("v2.dill.rewardsUsd"),
      value: "rewardsUsd",
    },
    {
      label: t("v2.dill.usdPerDill"),
      value: "usdPerDill",
    },
  ];

  return (
    <Select
      className="mt-5 w-1/3 rounded-xl border border-accent p-1"
      defaultValue={chart}
      closeMenuOnSelect={true}
      styles={styles}
      placeholder="Select Chart"
      onChange={(s) => chartChange(s as SelectOptions)}
      options={options}
    />
  );
};

const styles: StylesConfig<SelectOptions> = {
  control: (styles) => ({
    ...styles,
    color: "rgb(var(--color-primary))",
    backgroundColor: "rgb(var(--color-background-lightest))",
    borderRadius: 10,
    border: 0,
    boxShadow: "none",
  }),
  menu: (styles) => ({
    ...styles,
    color: "rgb(var(--color-foreground-alt-200))",
    backgroundColor: "rgb(var(--color-background-light))",
    border: "1px solid rgb(var(--color-accent))",
    borderRadius: 10,
    zIndex: 55,
    boxShadow: "0 0 0 1px rgb(var(--color-background-lightest))",
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "rgb(var(--color-foreground-alt-200))",
  }),
  option: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: isFocused ? "rgb(var(--color-background-lightest))" : undefined,
    borderRadius: 10,
    transition: "all 200ms ease-in-out",
  }),
  placeholder: (styles) => ({ ...styles, color: "rgb(var(--color-foreground-alt-200))" }),
};

export interface SelectOptions {
  value: string;
  label: string;
}

export default ChartSelect;
