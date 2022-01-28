import React, { FC } from "react";
import Select, {
  components,
  StylesConfig,
  ControlProps,
  OptionProps,
} from "react-select";
import { useTranslation } from "next-i18next";
import chroma from "chroma-js";
import { SearchIcon } from "@heroicons/react/solid";

import { colors } from "v2/features/farms/colors";

// TODO: Use resolveConfig once this gets merged:
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/58385
import { theme } from "tailwind.config";
const blackLight = theme.extend.colors.black.light;
const blackLighter = theme.extend.colors.black.lighter;
const orange = theme.extend.colors.orange.DEFAULT;
const green = theme.extend.colors.green.DEFAULT;
const grayOutlineLight = theme.extend.colors.gray["outline-light"];

interface Option {
  value: string;
  label: string;
  color: string;
  type: "token" | "protocol" | "network";
}

const Control = ({ children, ...props }: ControlProps<Option, true>) => (
  <components.Control {...props}>
    <SearchIcon className="w-6 h-6 text-gray-light ml-3 mr-1" />
    {children}
  </components.Control>
);

const Option = ({ children, ...props }: OptionProps<Option, true>) => (
  <components.Option {...props}>
    hi
    {children}
  </components.Option>
);

const options: Option[] = Object.entries(colors).map(([value, color]) => ({
  value,
  label: value.toUpperCase(),
  color,
  type: "token",
}));

const styles: StylesConfig<Option> = {
  clearIndicator: (styles) => ({
    ...styles,
    color: grayOutlineLight,
    ":hover": {
      color: "white",
    },
  }),
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
  menu: (styles) => ({
    ...styles,
    backgroundColor: blackLight,
    padding: 8,
    zIndex: 55,
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
  option: (styles, { data, isFocused }) => ({
    ...styles,
    backgroundColor: isFocused ? blackLighter : undefined,
    borderRadius: 10,
    color: data.color,
    transition: "all 0.3s ease-in-out",
  }),
};

const SearchBar: FC = () => {
  const { t } = useTranslation("common");

  return (
    <Select
      autoFocus
      escapeClearsValue
      isClearable
      isMulti
      openMenuOnClick={false}
      openMenuOnFocus={false}
      placeholder={t("v2.farms.filter")}
      components={{
        Control,
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
        Option,
      }}
      onChange={(value) => console.log(value)}
      options={options}
      styles={styles}
      theme={(theme) => ({
        ...theme,
        borderRadius: 10,
        colors: {
          ...theme.colors,
          primary25: "hotpink",
          primary: "black",
        },
      })}
    />
  );
};

export default SearchBar;
