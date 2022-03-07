import React, { FC } from "react";
import Select, { StylesConfig } from "react-select";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import { useAppDispatch } from "v2/store";
import { ThemeSelectors, setCurrentTheme, CurrentTheme } from "v2/store/theme";
import { rareThemes } from "./themes";

const styles: StylesConfig<CurrentTheme> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "rgb(var(--color-background-lightest))",
    border: 0,
    boxShadow: "none",
    padding: "8px 0",
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
    color: "rgb(var(--color-foreground-alt-300))",
    ":hover": {
      color: "rgb(var(--color-foreground-alt-200))",
    },
  }),
  input: (styles) => ({
    ...styles,
    color: "rgb(var(--color-primary))",
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "rgb(var(--color-background-light))",
    padding: 8,
    zIndex: 100,
    boxShadow: "0 0 0 1px rgb(var(--color-background-lightest))",
  }),
  option: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: isFocused ? "rgb(var(--color-background-lightest))" : undefined,
    borderRadius: 10,
    color: "rgb(var(--color-foreground-alt-200))",
    textAlign: "left",
    transition: "all 200ms ease-in-out",
    ":hover": {
      color: "rgb(var(--color-primary-light))",
    },
  }),
  singleValue: (styles) => ({
    ...styles,
    textAlign: "left",
    color: "rgb(var(--color-foreground-alt-200))",
  }),
};

const ThemeSelect: FC = () => {
  const { t } = useTranslation("common");
  const theme = useSelector(ThemeSelectors.selectTheme);
  const dispatch = useAppDispatch();

  return (
    <Select
      components={{
        IndicatorSeparator: () => null,
      }}
      isMulti={false}
      noOptionsMessage={() => t("v2.farms.noResults")}
      onChange={(newTheme) => dispatch(setCurrentTheme(newTheme as CurrentTheme))}
      options={rareThemes}
      defaultValue={rareThemes[0]}
      styles={styles}
      value={theme.current}
      theme={(theme) => ({
        ...theme,
        borderRadius: 10,
      })}
    />
  );
};

export default ThemeSelect;
