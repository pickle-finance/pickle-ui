import React, { useMemo } from "react";
import Select from "react-select";
import { Control, Controller } from "react-hook-form";
import { TokenInfo } from "@uniswap/token-lists";

export interface SwapSelect {
  label: string;
  value: TokenInfo;
}

export const SwapSelector = ({
  selected,
  control,
  list,
  name,
}: {
  selected: SwapSelect | undefined;
  control: Control<any, any>;
  list: {
    [tokenName: string]: {
      token: TokenInfo;
    };
  };
  name: string;
}) => {
  const options = useMemo(
    () =>
      Object.keys(list)
        .filter((item) => item !== selected?.label)
        .map((item) => ({ label: item, value: list[item].token })),
    [list, selected],
  );
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={""}
      rules={{ required: true }}
      render={({ field }) => (
        <Select
          className="basic-single text-black"
          classNamePrefix="select"

          isSearchable
          {...field}
          name="color"
          options={options}
        />
      )}
    />
  );
};
