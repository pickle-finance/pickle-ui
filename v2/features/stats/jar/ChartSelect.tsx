import React, { FC } from "react";
import Select from "react-select";

const pickleWhite = "#ebebeb";

const CHARTS: any = [
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
    value: "farmPicklePerDay",
    label: "Farm Pickle Per Day",
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

// daily revenue chart = bar chart of revenueExpenses.daily with 100 days of data and 15 and 30 day moving average

export const ChartSelect: FC<{ chartChange: any }> = ({ chartChange }) => {
  return (
    <Select
      styles={{
        input: (base) => ({
          ...base,
          color: pickleWhite,
        }),
        control: (base) => ({
          ...base,
          maxWidth: 200,
          marginLeft: 25,
          backgroundColor: "#111111",
          borderWidth: "1px",
          borderColor: "#475569",
          color: pickleWhite,
        }),
        menu: (provided, state) => ({
          ...provided,
          top: 40,
          maxWidth: 250,
          marginLeft: 25,
          borderRadius: 5,
          border: "2px solid #475569",
          backgroundColor: "#111111",
          color: pickleWhite,
          scrollbarColor: "dark",
        }),
      }}
      theme={(theme) => ({
        ...theme,
        borderRadius: 5,
        colors: {
          ...theme.colors,
          text: pickleWhite,
          primary: "#202020",
          primary25: "black",
          primary50: "black",
          primary75: "black",
          neutral10: "black",
          neutral80: pickleWhite,
        },
      })}
      defaultValue={{ label: "TVL", value: "tvl" }}
      onChange={(chart) => chartChange(chart)}
      options={CHARTS}
    />
  );
};
