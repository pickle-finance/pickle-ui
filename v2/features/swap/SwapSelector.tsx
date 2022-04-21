import React, { useMemo } from "react";
import Select from "react-select";
import { Control, Controller } from "react-hook-form";
import { TokenInfo } from "@uniswap/token-lists";

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
}: {
  selected: SwapSelect | undefined;
  control: Control<any, any>;
  list: SwapTokenMap;
  name: string;
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
      defaultValue={""}
      rules={{ required: true }}
      render={({ field }) => (
        <Select isSearchable {...field} name="tokens" options={options} />
      )}
    />
  );
};
