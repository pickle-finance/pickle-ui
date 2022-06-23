import React, { FC } from "react";
import Select from "react-select";

const ChartSelect: FC<{ chartChange: any }> = ({ chartChange }) => {
  return (
    <Select
      styles={{
        input: (base) => ({
          ...base,
          color: "rgb(var(--color-foreground-alt-200))",
        }),
        control: (base) => ({
          ...base,
          maxWidth: 350,
          marginLeft: 25,
          backgroundColor: "rgb(var(--color-background))",
          borderWidth: "1px",
          borderColor: "rgb(var(--color-foreground-alt-400))",
          color: "rgb(var(--color-foreground-alt-200))",
        }),
        menu: (provided) => ({
          ...provided,
          top: 40,
          maxWidth: 400,
          marginLeft: 25,
          borderRadius: 5,
          borderWidth: "2px",
          borderColor: "rgb(var(--color-foreground-alt-400))",
          backgroundColor: "rgb(var(--color-background))",
          color: "rgb(var(--color-foreground-alt-200))",
        }),
      }}
      theme={(theme) => ({
        ...theme,
        borderRadius: 5,
        colors: {
          ...theme.colors,
          text: "rgb(var(--color-foreground-alt-200))",
          primary: "rgb(var(--color-foreground-alt-300))",
          primary25: "rgb(var(--color-foreground-alt-400))",
          primary50: "black",
          primary75: "black",
          neutral10: "black",
          neutral80: "rgb(var(--color-foreground-alt-200))",
        },
      })}
      defaultValue={{ label: "TVL", value: "tvl" }}
      onChange={(chart) => chartChange(chart)}
      options={CHARTS}
    />
  );
};

const CHARTS = [
  {
    value: "value",
    label: "TVL",
  },
  {
    value: "balance",
    label: "Balance",
  },
  {
    value: "depositTokenPrice",
    label: "Deposit Token Price",
  },
  {
    value: "farmAllocShare",
    label: "Farm Allocation Share",
  },
  {
    value: "harvestable",
    label: "Harvestable",
  },
  {
    value: "ptokensInFarm",
    label: "Percent of pTokens In Farm",
  },
  {
    value: "ratio",
    label: "Ratio",
  },
  {
    value: "yield",
    label: "APR and APY Yield",
  },
  {
    value: "tokenPriceVNum",
    label: "Token Price And Count",
  },
  {
    value: "revs",
    label: "Daily Revenue",
  },
];

export default ChartSelect;
