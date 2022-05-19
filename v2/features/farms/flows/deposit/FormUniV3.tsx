import { ChangeEvent, FC, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import ErrorMessage from "../Error";
import AmountSteps from "v2/components/AmountSteps";
import { JarWithData } from "v2/store/core";

interface Props {
  balance0: number;
  balance1: number;
  jar: JarWithData;
  nextStep: (amount: string, amount1: string) => void;
}

const FormUniV3: FC<Props> = ({ balance0, balance1, jar, nextStep }) => {
  const { t } = useTranslation("common");
  const [amount0, setAmount0] = useState<string>(balance0.toString());
  const [amount1, setAmount1] = useState<string>(balance1.toString());

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
      (amount0Num > 0 || amount1Num) && amount0Num <= balance0 && amount1Num <= balance1;
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
            {t("v2.balances.balance")}: {balance0}
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
              setAmount0(balance0.toString());
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
            {t("v2.balances.balance")}: {balance1}
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
              setAmount1(balance1.toString());
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
