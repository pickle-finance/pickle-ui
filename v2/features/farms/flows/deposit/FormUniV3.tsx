import { ChangeEvent, FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { Switch } from "@headlessui/react";
import { useWeb3React } from "@web3-react/core";
import type { Web3Provider } from "@ethersproject/providers";
import { formatEther, formatUnits, parseEther, parseUnits } from "ethers/lib/utils";

import Button from "v2/components/Button";
import ErrorMessage from "../Error";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { truncateToMaxDecimals } from "v2/utils";
import TokenOptions from "./TokenOptions";
import { useAppSelector } from "v2/store";
import OnOffToggle from "v2/components/OnOffToggle";

type TokenType = "native" | "wrapped";

export interface TokenSelect {
  label: string;
  value: TokenType;
}

interface Props {
  jar: JarWithData;
  balance0: string;
  balance1: string;
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
    jar.token0?.isNative && selectedToken.value === "native" ? nativeBalance : balance0;

  const usedBalance1 =
    jar.token1?.isNative && selectedToken.value === "native" ? nativeBalance : balance1;

  const displayBalance0Str = formatUnits(usedBalance0, token0Decimals);

  const displayBalance1Str = formatUnits(usedBalance1, token1Decimals);

  const invalidAmountError = Error(t("v2.farms.invalidAmount"));
  const [error, setError] = useState<Error | undefined>();

  const validate = () => {
    const amount0BN = parseUnits(amount0 || "0", token0Decimals);
    const amount1BN = parseUnits(amount1 || "0", token1Decimals);

    if (amount0BN.eq(0) && amount1BN.eq(0)) {
      setError(invalidAmountError);
      return;
    }

    const isValid = amount0BN.lte(usedBalance0) && amount1BN.lte(usedBalance1);
    isValid ? setError(undefined) : setError(invalidAmountError);
  };

  let inputAmount0, inputAmount1;
  const handleChange0 = (event: ChangeEvent<HTMLInputElement> | string) => {
    // Use user input
    if ((event as ChangeEvent<HTMLInputElement>).target) {
      const { value } = (event as ChangeEvent<HTMLInputElement>).target;
      inputAmount0 = value;
    }
    // Use max balance
    else {
      inputAmount0 = displayBalance0Str;
    }

    setAmount0(inputAmount0);
    if (!shouldZap && inputAmount0) {
      const token1Amount = parseUnits(inputAmount0, token0Decimals)
        .mul(jar.depositToken.proportion || parseEther("1"))
        .div(parseEther("1"));
      setAmount1(truncateToMaxDecimals(formatUnits(token1Amount, token1Decimals), token1Decimals));
    }
  };

  const handleChange1 = (event: ChangeEvent<HTMLInputElement> | string) => {
    if ((event as ChangeEvent<HTMLInputElement>).target) {
      const { value } = (event as ChangeEvent<HTMLInputElement>).target;
      inputAmount1 = value;
    } else {
      inputAmount1 = displayBalance1Str;
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
      setNativeBalance((await library?.getSigner()?.getBalance())?.toString() || "0");
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
            {t("v2.balances.balance")}: {displayBalance0Str}
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
              handleChange0(balance0);
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
            {t("v2.balances.balance")}: {displayBalance1Str}
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
        <OnOffToggle toggleOn={shouldZap} onChange={() => setShouldZap(!shouldZap)}>
          <span className="text-sm font-medium text-foreground-alt-200">
            {t("v2.farms.autoswap")}
          </span>
        </OnOffToggle>
      )}
      <ErrorMessage error={error} />
      <Button state={error ? "disabled" : "enabled"} onClick={handleFormSubmit}>
        {t("v2.actions.confirm")}
      </Button>
    </>
  );
};

export default FormUniV3;
