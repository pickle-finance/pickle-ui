import React, { useMemo } from "react";
import Select, { StylesConfig } from "react-select";
import { Control, Controller } from "react-hook-form";
import { TokenInfo } from "@uniswap/token-lists";
import { CurrentTheme } from "v2/store/theme";

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
    width: "80px",
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "rgb(var(--color-background-light))",
    padding: 8,
    zIndex: 100,
    boxShadow: "0 0 0 1px rgb(var(--color-background-lightest))",
    width: "150px",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "200px",

    "::-webkit-scrollbar": {
      width: "0px",
    },
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

export interface SwapSelect {
  label: string;
  value: TokenInfo;
}

export interface SwapTokenMap {
  [tokenName: string]: {
    token: TokenInfo;
  };
}

export const SwapSelector = ({
  selected,
  control,
  list,
  name,
  disabled,
}: {
  selected: SwapSelect | undefined;
  control: Control<any, any>;
  list: SwapTokenMap;
  name: string;
  disabled?: boolean;
}) => {
  const options = useMemo(
    () =>
      Object.keys(list)
        .filter((item) => item !== selected?.label)
        .map((item) => ({ label: list[item].token.symbol, value: list[item].token })),
    [list, selected],
  );
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: true }}
      render={({ field }) => (
        <Select
          styles={styles}
          className="swap-select"
          classNamePrefix="swap-select-item"
          isSearchable
          {...field}
          name="tokens"
          options={options}
          isDisabled={disabled}
        />
      )}
    />
  );
};
