import { Web3Provider } from "@ethersproject/providers";
import { TokenInfo } from "@uniswap/token-lists";
import { Input } from "@geist-ui/react";
import { useWeb3React } from "@web3-react/core";
import React, { ChangeEvent, useCallback, useEffect, useState, KeyboardEvent } from "react";
import { Control, Controller } from "react-hook-form";
import { useTokenContract } from "../farms/flows/hooks";
import { OrderKind } from "@cowprotocol/cow-sdk";

const ETHEREUM_MAX_AMOUNT = /^\d*\.?\d*$/;
export const SwapInput = ({
  control,
  name,
  token,
  setKind,
  kind,
  disabled,
}: {
  control: Control<any, any>;
  name: string;
  token: TokenInfo | undefined;
  setKind: (kind: OrderKind) => void;
  kind: OrderKind;
  disabled?: boolean;
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
    setKind(kind);
    onChange(e);
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
      rules={{
        required: true,
      }}
      render={({ field }) => {
        const { onChange, ...rest } = field;
        return (
          <input
            className="text-white	bg-transparent w-full	outline-none text-lg"
            style={{ height: "60px" }}
            {...rest}
            dir="rtl"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder="0.0"
            minLength={1}
            maxLength={79}
            spellCheck="false"
            width="100%"
            onKeyPress={onKeyPressHandler}
            onChange={onChangeHandler(onChange)}
            disabled={disabled}
          />
        );
      }}
    />
  );
};
