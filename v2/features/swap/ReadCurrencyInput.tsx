import { Link } from "@material-ui/core";
import React, { FC, useMemo } from "react";
import { Control } from "react-hook-form";
import { SwapInput } from "./SwapInput";
import { SwapSelect, SwapSelector, SwapTokenMap } from "./SwapSelector";
import { OrderKind } from "@cowprotocol/cow-sdk";
import { getAmountWRTUpperDenom } from "./utils";

export interface ReadCurrencyInputProps {
  tokenA: SwapSelect | undefined;
  amount: string;
}

export const ReadCurrencyInput: FC<ReadCurrencyInputProps> = ({ tokenA, amount }) => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          border: "1px solid",
          padding: "30px 30px 0px",
          height: "100px",
          borderRadius: "10px",
          backgroundColor: "rgb(15, 38, 6",
          fontSize: "16px",
        }}
      >
        <div>{tokenA?.label}</div>
        <div>{amount}</div>
      </div>
    </div>
  );
};
