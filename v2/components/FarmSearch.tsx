import React, { FC, useState } from "react";
import Select, {
  components,
  StylesConfig,
  ControlProps,
  OptionProps,
} from "react-select";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import chroma from "chroma-js";
import { SearchIcon } from "@heroicons/react/solid";
import { useSelector } from "react-redux";

import { Filter, CoreSelectors } from "v2/store/core";
import { defaultBackgroundColor } from "v2/features/farms/colors";
import { theme } from "tailwind.config";

const blackLight = theme.extend.colors.black.light;
const blackLighter = theme.extend.colors.black.lighter;
const orange = theme.extend.colors.orange.DEFAULT;
const green = theme.extend.colors.green.DEFAULT;
const grayOutlineLight = theme.extend.colors.gray["outline-light"];

const Control = ({ children, ...props }: ControlProps<Filter, true>) => (
  <components.Control {...props}>
    <SearchIcon className="w-6 h-6 text-gray-light ml-3 mr-1" />
    {children}
  </components.Control>
);

const OptionImage: FC<Filter> = ({ color, imageSrc, label }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  return (
    <div
      className="mr-3 w-8 h-8 rounded-full border-3 border-gray-outline"
      style={{ background: isLoaded ? defaultBackgroundColor : color }}
    >
      <Image
        src={imageSrc}
        className="rounded-full"
        width={32}
        height={32}
        layout="intrinsic"
        alt={label}
        title={label}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
};

const Option = ({ children, ...props }: OptionProps<Filter, true>) => {
  const { t } = useTranslation("common");
  const { type } = props.data;

  return (
    <components.Option {...props} className="group">
      <div className="flex items-center">
        <OptionImage {...props.data} />
        <div>
          <p className="text-white font-title text-base group-hover:text-green-light transition duration-200 ease-in-out">
            {children}
          </p>
          <p className="font-normal text-sm text-gray-light italic">
            {t(`v2.farms.${type}`)}
          </p>
        </div>
      </div>
    </components.Option>
  );
};

const styles: StylesConfig<Filter> = {
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
        chroma.contrast(darker, "black") >= 5 ? darker.css() : "white",
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
    transition: "all 200ms ease-in-out",
  }),
};

const SearchBar: FC = () => {
  const { t } = useTranslation("common");
  const filters = useSelector(CoreSelectors.selectFilters);

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
      options={filters}
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
