import { ChangeEvent, FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { Switch } from "@headlessui/react";
import { useWeb3React } from "@web3-react/core";
import type { Web3Provider } from "@ethersproject/providers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";

import Button from "v2/components/Button";
import ErrorMessage from "../Error";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { classNames, truncateToMaxDecimals } from "v2/utils";
import TokenOptions from "./TokenOptions";
import { useAppSelector } from "v2/store";

type TokenType = "native" | "wrapped";

export interface TokenSelect {
  label: string;
  value: TokenType;
}

interface Props {
  jar: JarWithData;
  balance0: number;
  balance1: number;
  token0Decimals: number;
  token1Decimals: number;
  canZap: boolean;
  shouldZap: boolean;
  setShouldZap: (e: any) => void;
  nextStep: (amount: string, amount1: string, useNative: boolean) => void;
}

const FormUniV3: FC<Props> = ({
  jar,
  balance0,
  balance1,
  token0Decimals,
  token1Decimals,
  canZap,
  shouldZap,
  setShouldZap,
  nextStep,
}) => {
  const { t } = useTranslation("common");
  const core = useAppSelector(CoreSelectors.selectCore);

  const [amount0, setAmount0] = useState<string>("0");
  const [amount1, setAmount1] = useState<string>("0");
  const [nativeBalance, setNativeBalance] = useState<string>("0");

  const { library } = useWeb3React<Web3Provider>();

  const jarChain = core?.chains.find((chain) => chain.network === jar.chain);

  const [selectedToken, setSelectedToken] = useState<TokenSelect>({
    label: jarChain?.gasTokenSymbol.toUpperCase() || "",
    value: "native",
  });

  const usedBalance0 =
    jar.token0?.isNative && selectedToken.value === "native" ? parseFloat(nativeBalance) : balance0;

  const usedBalance1 =
    jar.token1?.isNative && selectedToken.value === "native" ? parseFloat(nativeBalance) : balance1;

  const invalidAmountError = Error(t("v2.farms.invalidAmount"));
  const [error, setError] = useState<Error | undefined>();

  const validate = () => {
    const amount0Num = parseFloat(amount0);
    const amount1Num = parseFloat(amount1);

    if (!amount0 || !amount1) {
      setError(invalidAmountError);
      return;
    }

    const isValid =
      (amount0Num || amount1Num) && amount0Num <= usedBalance0 && amount1Num <= usedBalance1;
    isValid ? setError(undefined) : setError(invalidAmountError);
  };

  let inputAmount0, inputAmount1;
  const handleChange0 = (event: ChangeEvent<HTMLInputElement> | number) => {
    if ((event as ChangeEvent<HTMLInputElement>).target) {
      const { value } = (event as ChangeEvent<HTMLInputElement>).target;
      inputAmount0 = value;
    } else {
      inputAmount0 =
        jar.token0?.isNative && selectedToken.value === "native"
          ? nativeBalance
          : balance0.toString();
    }

    setAmount0(inputAmount0);
    if (!shouldZap && inputAmount0) {
      const token1Amount = parseUnits(inputAmount0, token0Decimals)
        .mul(jar.depositToken.proportion || parseEther("1"))
        .div(parseEther("1"));
      setAmount1(truncateToMaxDecimals(formatUnits(token1Amount, token1Decimals), token1Decimals));
    }
  };

  const handleChange1 = (event: ChangeEvent<HTMLInputElement> | number) => {
    if ((event as ChangeEvent<HTMLInputElement>).target) {
      const { value } = (event as ChangeEvent<HTMLInputElement>).target;
      inputAmount1 = value;
    } else {
      inputAmount1 = usedBalance1.toString();
    }
    setAmount1(inputAmount1);
    if (!shouldZap && inputAmount1) {
      const token0Amount = parseUnits(inputAmount1, token1Decimals)
        .mul(parseEther("1"))
        .div(jar.depositToken.proportion || parseEther("1"));

      setAmount0(truncateToMaxDecimals(formatUnits(token0Amount, token0Decimals), token0Decimals));
    }
  };

  useEffect(() => {
    validate();
  }, [amount0, amount1]);

  useEffect(() => {
    const setBalance = async () =>
      setNativeBalance(formatEther((await library?.getSigner()?.getBalance()) || "0"));
    setBalance();
  }, [library]);

  const handleFormSubmit = () => {
    if (error) return;

    nextStep(amount0, amount1, selectedToken.value === "native");
  };

  return (
    <>
      <h2 className="text-foreground-alt-100 flex font-title text-lg mb-4 ml-4">
        <TokenOptions
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          token={jar.token0!}
        />{" "}
      </h2>
      <div className="bg-background-lightest rounded-xl px-4 py-2 mb-6">
        <div className="flex justify-between mb-2">
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.balances.amount")}
          </p>
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.balances.balance")}: {usedBalance0}
          </p>
        </div>

        <div className="flex justify-between">
          <input
            type="number"
            className="w-3/5 bg-transparent focus:outline-none flex-shrink-0 font-medium text-primary leading-7"
            value={amount0}
            onChange={handleChange0}
          />
          <Button
            size="small"
            onClick={() => {
              handleChange0(balance1);
            }}
          >
            {t("v2.balances.max")}
          </Button>
        </div>
      </div>

      <h2 className="text-foreground-alt-100 flex font-title text-lg mt-6 mb-4 ml-4">
        <TokenOptions
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          token={jar.token1!}
        />
      </h2>
      <div className="bg-background-lightest rounded-xl px-4 py-2 mb-6">
        <div className="flex justify-between mb-2">
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.balances.amount")}
          </p>
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.balances.balance")}: {usedBalance1}
          </p>
        </div>

        <div className="flex justify-between">
          <input
            type="number"
            className="w-3/5 bg-transparent focus:outline-none flex-shrink-0 font-medium text-primary leading-7"
            value={amount1}
            onChange={handleChange1}
          />
          <Button
            size="small"
            onClick={() => {
              handleChange1(balance1);
            }}
          >
            {t("v2.balances.max")}
          </Button>
        </div>
      </div>

      {canZap && (
        <Switch.Group as="div" className="flex items-center mb-4 ml-2">
          <Switch
            checked={shouldZap}
            onChange={() => setShouldZap(!shouldZap)}
            className={classNames(
              shouldZap ? "bg-primary" : "bg-foreground-alt-400",
              "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-2000",
            )}
          >
            <span
              aria-hidden="true"
              className={classNames(
                shouldZap ? "translate-x-5" : "translate-x-0",
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-foreground-button transform ring-0 transition ease-in-out duration-200",
              )}
            >
              <span
                className={classNames(
                  shouldZap
                    ? "opacity-0 ease-out duration-100"
                    : "opacity-100 ease-in duration-200",
                  "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity",
                )}
                aria-hidden="true"
              >
                <svg className="h-3 w-3 text-foreground-alt-300" fill="none" viewBox="0 0 12 12">
                  <path
                    d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span
                className={classNames(
                  shouldZap
                    ? "opacity-100 ease-in duration-200"
                    : "opacity-0 ease-out duration-100",
                  "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity",
                )}
                aria-hidden="true"
              >
                <svg className="h-3 w-3 text-accent" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                </svg>
              </span>
            </span>
          </Switch>
          <Switch.Label as="span" className="ml-3">
            <span className="text-sm font-medium text-foreground-alt-200">
              {t("v2.farms.autoswap")}
            </span>
          </Switch.Label>
        </Switch.Group>
      )}
      <ErrorMessage error={error} />
      <Button state={error ? "disabled" : "enabled"} onClick={handleFormSubmit}>
        {t("v2.actions.confirm")}
      </Button>
    </>
  );
};

export default FormUniV3;
