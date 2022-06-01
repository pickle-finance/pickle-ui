import React, { FC, useState } from "react";
import Select, { components, StylesConfig, ControlProps, OptionProps } from "react-select";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import chroma from "chroma-js";
import { SearchIcon } from "@heroicons/react/solid";
import { useSelector } from "react-redux";

import { classNames } from "v2/utils";
import { useAppDispatch } from "v2/store";
import { CoreSelectors } from "v2/store/core";
import { ControlsSelectors, Filter, setFilters } from "v2/store/controls";
import { defaultBackgroundColor } from "v2/features/farms/colors";

const Control = ({ children, ...props }: ControlProps<Filter, true>) => (
  <components.Control {...props}>
    <SearchIcon className="w-6 h-6 text-foreground-alt-200 ml-3 mr-1" />
    {children}
  </components.Control>
);

const OptionImage: FC<Filter> = ({ color, imageSrc, label }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  return (
    <div
      className="mr-3 w-8 h-8 rounded-full border-3 border-foreground-alt-400"
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
  // Correctly highlight active option when navigating the menu using arrows keys
  const { isFocused } = props;
  const { type } = props.data;

  return (
    <components.Option {...props} className="group">
      <div className="flex items-center">
        <OptionImage {...props.data} />
        <div>
          <p
            className={classNames(
              "text-foreground font-title text-base group-hover:text-primary-light transition duration-200 ease-in-out",
              isFocused && "text-primary-light",
            )}
          >
            {children}
          </p>
          <p className="font-normal text-sm text-foreground-alt-200 italic">
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
    color: "rgb(var(--color-foreground-alt-300))",
    ":hover": {
      color: "rgb(var(--color-foreground-alt-200))",
    },
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: "rgb(var(--color-background-lightest))",
    border: 0,
    boxShadow: "none",
    padding: "8px 0",
  }),
  input: (styles) => ({
    ...styles,
    color: "rgb(var(--color-primary))",
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "rgb(var(--color-background-light))",
    padding: 8,
    zIndex: 200,
    boxShadow: "0 0 0 1px rgb(var(--color-background-lightest))",
  }),
  multiValue: (styles, { data }) => {
    return {
      ...styles,
      backgroundColor: chroma(data.color).css(),
    };
  },
  multiValueLabel: (styles, { data }) => {
    const darker = chroma(data.color).darken(3);

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
      chroma.contrast(data.color, "white") >= 7 ? "white" : chroma(data.color).darken(2.5).css(),
    ":hover": {
      color: "white",
      backgroundColor: "rgb(var(--color-accent))",
    },
  }),
  option: (styles, { data, isFocused }) => ({
    ...styles,
    backgroundColor: isFocused ? "rgb(var(--color-background-lightest))" : undefined,
    borderRadius: 10,
    color: data.color,
    transition: "all 200ms ease-in-out",
  }),
};

const SearchBar: FC = () => {
  const { t } = useTranslation("common");
  const options = useSelector(CoreSelectors.selectFilters);
  const filters = useSelector(ControlsSelectors.selectFilters);
  const dispatch = useAppDispatch();

  return (
    <Select
      autoFocus
      components={{
        Control,
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
        Option,
      }}
      escapeClearsValue
      isClearable
      isMulti
      openMenuOnClick={false}
      openMenuOnFocus={false}
      placeholder={t("v2.farms.filter")}
      noOptionsMessage={() => t("v2.farms.noResults")}
      onChange={(filters) => dispatch(setFilters(filters))}
      options={options}
      styles={styles}
      theme={(theme) => ({
        ...theme,
        borderRadius: 10,
        colors: {
          ...theme.colors,
          primary: "black",
        },
      })}
      value={filters}
    />
  );
};

export default SearchBar;
