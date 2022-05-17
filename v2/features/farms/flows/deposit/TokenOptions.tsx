import { useTranslation } from "next-i18next";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import Select, { StylesConfig } from "react-select";
import { UniV3Token } from "v2/store/core";
import { getNativeName } from "../utils";
import { TokenSelect } from "./FormUniV3";

const TokenOptions: FC<{
  token: UniV3Token;
  selectedToken: SelectOptions;
  setSelectedToken: Dispatch<SetStateAction<TokenSelect>>;
}> = ({ token, selectedToken, setSelectedToken }) => {
  const [selectOptions, setSelectOptions] = useState<SelectOptions[]>([]);

  const tokenChange = (token: TokenSelect): void => {
    setSelectedToken(token);
  };

  useEffect(() => {
    const nativeName = getNativeName(token.name);
    const wrappedName = "W" + nativeName;
    const options: Array<TokenSelect> = [
      {
        label: nativeName,
        value: "native",
      },
      {
        label: wrappedName,
        value: "wrapped",
      },
    ];
    setSelectOptions(options);
  }, []);

  if (!token.isNative) return <>{token.name.toUpperCase()}</>;
  return (
    <>
      <Select
        className="mt-5 w-1/3"
        defaultValue={selectedToken}
        closeMenuOnSelect={true}
        styles={styles}
        onChange={(s) => tokenChange(s as TokenSelect)}
        options={selectOptions}
      />
    </>
  );
};

const styles: StylesConfig<SelectOptions> = {
  control: (styles) => ({
    ...styles,
    color: "rgb(var(--color-primary))",
    backgroundColor: "rgb(var(--color-background-lightest))",
    border: 0,
    boxShadow: "none",
    marginLeft: "-15px",
  }),
  menu: (styles) => ({
    ...styles,
    color: "rgb(var(--color-foreground-alt-200))",
    backgroundColor: "rgb(var(--color-background-light))",
    padding: 8,
    zIndex: 55,
    boxShadow: "0 0 0 1px rgb(var(--color-background-lightest))",
    marginLeft: "-15px",
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
};

interface SelectOptions {
  value: string;
  label: string;
}

type SetTokenFunction = (chain: SelectOptions) => void;

export default TokenOptions;
