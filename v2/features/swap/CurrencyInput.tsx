import { Link } from "@material-ui/core";
import React, { FC, useMemo } from "react";
import { Control } from "react-hook-form";
import { SwapInput } from "./SwapInput";
import { SwapSelect, SwapSelector, SwapTokenMap } from "./SwapSelector";
import { OrderKind } from "@cowprotocol/cow-sdk";
import { getAmountWRTUpperDenom } from "./utils";

export interface CurrencyInputProps {
  tokenA: SwapSelect | undefined;
  selectorName: string;
  inputName: string;
  control: Control<any, any>;
  list: SwapTokenMap;
  tokenB: SwapSelect | undefined;
  tokenBalance: string;
  setValue: any;
  setKind: (kind: OrderKind) => void;
  kind: OrderKind;
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
  setKind,
  kind,
}) => {
  const memoTokenBalance = useMemo<string>(
    () => getAmountWRTUpperDenom(tokenBalance, tokenA?.value.decimals ?? 18),
    [tokenBalance, tokenA],
  );

  return (
    <div>
      <div className="flex border-solid border-2 pt-5 px-4 bg-[#0f2606] rounded-2xl h-[6rem]">
        <SwapSelector control={control} list={list} name={selectorName} selected={tokenB} />
        <SwapInput
          token={tokenA?.value}
          name={inputName}
          control={control}
          setKind={setKind}
          kind={kind}
        />
      </div>
      {kind === OrderKind.SELL && (
        <div>
          <span>
            {!!tokenBalance && (
              <Link onClick={() => setValue(inputName, memoTokenBalance)}>Max:</Link>
            )}
          </span>{" "}
          <span>{!!tokenBalance && memoTokenBalance}</span>
        </div>
      )}
    </div>
  );
};
