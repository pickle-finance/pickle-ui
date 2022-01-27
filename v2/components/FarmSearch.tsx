import React, { FC } from "react";
import Select, { components, StylesConfig, ControlProps } from "react-select";
import { useTranslation } from "next-i18next";
import chroma from "chroma-js";
import { SearchIcon } from "@heroicons/react/solid";

import { colors } from "v2/features/farms/colors";

// TODO: Use resolveConfig once this gets merged:
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/58385
import { theme } from "tailwind.config";
const blackLighter = theme.extend.colors.black.lighter;
const orange = theme.extend.colors.orange.DEFAULT;
const green = theme.extend.colors.green.DEFAULT;
const grayOutlineLight = theme.extend.colors.gray["outline-light"];

interface Option {
  readonly value: string;
  readonly label: string;
  readonly color: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}

const Control = ({ children, ...props }: ControlProps<Option, true>) => (
  <components.Control {...props}>
    <SearchIcon className="w-6 h-6 text-gray-light ml-3 mr-1" />
    {children}
  </components.Control>
);

const options: Option[] = Object.entries(colors).map(([value, color]) => ({
  value,
  label: value.toUpperCase(),
  color,
}));

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
    };
  },
  control: (styles) => ({
    ...styles,
    backgroundColor: blackLighter,
    border: 0,
    padding: "8px 0",
  }),
  input: (styles) => ({
    ...styles,
    color: green,
  }),
  multiValue: (styles, { data }) => {
    return {
      ...styles,
      backgroundColor: chroma(data.color).css(),
    };
  },
  multiValueLabel: (styles, { data }) => {
    const darker = chroma(data.color).darken(2.5);

    return {
      ...styles,
      fontWeight: 700,
      color:
        // Darken the label color if it ends up with sufficient contrast
        chroma.contrast(darker, "black") >= 3 ? darker.css() : "white",
    };
  },
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color:
      chroma.contrast(data.color, "white") >= 7
        ? "white"
        : chroma(data.color).darken(2.5).css(),
    ":hover": {
      color: "white",
      backgroundColor: orange,
    },
  }),
  clearIndicator: (styles) => ({
    ...styles,
    color: grayOutlineLight,
    ":hover": {
      color: "white",
    },
  }),
};

const SearchBar: FC = () => {
  const { t } = useTranslation("common");

  return (
    <Select
      components={{
        Control,
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
