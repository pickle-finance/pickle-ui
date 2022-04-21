import { Grid } from "@geist-ui/react";
import { Link } from "@material-ui/core";
import React, { FC } from "react";
import { Control } from "react-hook-form";
import { SwapInput } from "./SwapInput";
import { SwapSelect, SwapSelector, SwapTokenMap } from "./SwapSelector";

export interface CurrencyInputProps {
  tokenA: SwapSelect | undefined;
  selectorName: string;
  inputName: string;
  control: Control<any, any>;
  list: SwapTokenMap;
  tokenB: SwapSelect | undefined;
  tokenBalance: string;
  setValue: any;
}

export const CurrencyInput: FC<CurrencyInputProps> = ({
  tokenA,
  selectorName,
  inputName,
  control,
  list,
  tokenB,
  tokenBalance,
  setValue,
}) => {
  return (
    <div className="text-white">
      <Grid.Container gap={2} justify="center">
        <Grid xs={10}>
          <SwapSelector control={control} list={list} name={selectorName} selected={tokenB} />
        </Grid>
        <Grid xs={14}>
          <SwapInput token={tokenA?.value} name={inputName} control={control} />
        </Grid>
        <Grid xs={24}>
          <div className="text-left">
            <span>
              {!!tokenBalance && <Link onClick={() => setValue(inputName, tokenBalance)}>Max</Link>}
            </span>{" "}
            <span>{!!tokenBalance && `Balance: ${tokenBalance}`}</span>
          </div>
        </Grid>
      </Grid.Container>
    </div>
  );
};
