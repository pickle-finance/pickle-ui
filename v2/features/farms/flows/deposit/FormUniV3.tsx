import { ChangeEvent, FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import ErrorMessage from "../Error";
import AmountSteps from "v2/components/AmountSteps";
import { JarWithData } from "v2/store/core";
import { formatUnits, parseUnits } from "ethers/lib/utils";

interface Props {
  balance0: string;
  balance1: string;
  token0Decimals: number;
  token1Decimals: number;
  jar: JarWithData;
  nextStep: (amount: string, amount1: string) => void;
}

const FormUniV3: FC<Props> = ({
  balance0,
  balance1,
  token0Decimals,
  token1Decimals,
  jar,
  nextStep,
}) => {
  const { t } = useTranslation("common");

  const displayBalance0Str = formatUnits(balance0, token0Decimals);
  const displayBalance1Str = formatUnits(balance1, token1Decimals);

  const [amount0, setAmount0] = useState<string>(displayBalance0Str);
  const [amount1, setAmount1] = useState<string>(displayBalance1Str);

  const invalidAmountError = Error(t("v2.farms.invalidAmount"));
  const [error, setError] = useState<Error | undefined>();

  const validate = () => {
    const amount0BN = parseUnits(amount0, token0Decimals);
    const amount1BN = parseUnits(amount1, token1Decimals);
    if (amount0BN.eq(0) && amount1BN.eq(0)) {
      setError(invalidAmountError);
      return;
    }

    const isValid = amount0BN.lte(balance0) && amount1BN.lte(balance1);
    isValid ? setError(undefined) : setError(invalidAmountError);
  };

  const handleChange0 = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setAmount0(value);
  };

  const handleChange1 = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setAmount1(value);
  };

  useEffect(() => {
    validate();
  }, [amount0, amount1]);

  const handleFormSubmit = () => {
    if (error) return;

    nextStep(amount0, amount1);
  };

  return (
    <>
      <h2 className="text-foreground-alt-100 flex font-title text-lg mb-4 ml-4">
        {jar.token0?.name.toUpperCase()}
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
              setAmount0(displayBalance0Str);
            }}
          >
            {t("v2.balances.max")}
          </Button>
        </div>
      </div>

      <h2 className="text-foreground-alt-100 flex font-title text-lg mt-6 mb-4 ml-4">
        {jar.token1?.name.toUpperCase()}
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
              setAmount1(displayBalance1Str);
            }}
          >
            {t("v2.balances.max")}
          </Button>
        </div>
      </div>

      <ErrorMessage error={error} />
      <Button state={error ? "disabled" : "enabled"} onClick={handleFormSubmit}>
        {t("v2.actions.confirm")}
      </Button>
    </>
  );
};

export default FormUniV3;
