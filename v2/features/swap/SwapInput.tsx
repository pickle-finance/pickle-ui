import { Web3Provider } from "@ethersproject/providers";
import { TokenInfo } from "@uniswap/token-lists";
import { useWeb3React } from "@web3-react/core";
import React, { ChangeEvent, useCallback, useEffect, useState, KeyboardEvent } from "react";
import { Control, Controller } from "react-hook-form";
import { useTokenContract } from "../farms/flows/hooks";
const ETHEREUM_MAX_AMOUNT = /^\d*\.?\d*$/;
export const SwapInput = ({
  control,
  name,
  token,
}: {
  control: Control<any, any>;
  name: string;
  token: TokenInfo | undefined;
}) => {
  const { account } = useWeb3React<Web3Provider>();
  const [balanceOf, setBalanceOf] = useState<string>("0");
  const Token = useTokenContract(token?.address ?? "");
  const setBalanceData = useCallback(async () => {
    // TODO: need to add error condition
    if (!account) return;
    setBalanceOf((await Token?.balanceOf(account))?.toString() ?? "0");
  }, [Token, setBalanceOf]);

  useEffect(() => {
    if (!token?.address) return;
    setBalanceData();
  }, [token]);

  const onChangeHandler = (onChange: (e: ChangeEvent<HTMLInputElement>) => void) => (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    if (+e.target.value > -1 && +e.target.value <= +balanceOf) {
      onChange(e);
    }
  };

  const onKeyPressHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!ETHEREUM_MAX_AMOUNT.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue="0"
      rules={
        {
          // required: true,
        }
      }
      render={({ field }) => {
        const { onChange, ...rest } = field;
        return (
          <input
            style={{
              color: "black",
            }}
            {...rest}
            onKeyPress={onKeyPressHandler}
            onChange={onChangeHandler(onChange)}
          />
        );
      }}
    />
  );
};
