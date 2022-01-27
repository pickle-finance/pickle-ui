import React, { FC } from "react";
import Select, { StylesConfig } from "react-select";
import { useTranslation } from "next-i18next";
import chroma from "chroma-js";

// TODO: Use resolveConfig once this gets merged:
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/58385
import { theme } from "tailwind.config";
const blackLighter = theme.extend.colors.black.lighter;

export interface Option {
  readonly value: string;
  readonly label: string;
  readonly color: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}

const options: Option[] = [
  { value: "aave", label: "AAVE", color: "#4aa4be" },
  { value: "alcx", label: "ALCX", color: "#edc0a1" },
  { value: "alusd", label: "ALUSD", color: "#edc0a1" },
  { value: "aurora", label: "AURORA", color: "#6ed34a" },
  { value: "auroraswap", label: "AuroraSwap", color: "#25caa0" },
  { value: "maapl", label: "MAAPL", color: "#000000" },
  { value: "near", label: "NEAR", color: "#fdfdfd" },
];

const styles: StylesConfig<Option> = {
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
        ? data.color
        : isFocused
        ? color.alpha(0.15).css()
        : undefined,
      color: isDisabled
        ? "#ccc"
        : isSelected
        ? chroma.contrast(color, "white") > 2
          ? "white"
          : "black"
        : data.color,

      ":active": {
        ...styles[":active"],
        backgroundColor: !isDisabled
          ? isSelected
            ? data.color
            : color.alpha(0.3).css()
          : undefined,
      },
    };
  },
  control: (styles) => ({
    ...styles,
    backgroundColor: blackLighter,
    border: 0,
    padding: "8px 0",
  }),
  multiValue: (styles, { data }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: color.alpha(0.15).css(),
    };
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ":hover": {
      backgroundColor: data.color,
      color: chroma.contrast(data.color, "white") > 2 ? "white" : "black",
    },
  }),
};

const SearchBar: FC = () => {
  const { t } = useTranslation("common");

  return (
    <Select
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
      }}
      placeholder={t("v2.farms.filter")}
      isMulti
      isClearable
      autoFocus
      theme={(theme) => ({
        ...theme,
        borderRadius: 10,
        colors: {
          ...theme.colors,
          primary25: "hotpink",
          primary: "black",
        },
      })}
      onChange={(value) => console.log(value)}
      styles={styles}
      options={options}
    />
  );
};

export default SearchBar;
