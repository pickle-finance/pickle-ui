import { ChangeEvent, FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";

import Button from "v2/components/Button";
import ErrorMessage from "../Error";
import AmountSteps from "v2/components/AmountSteps";

interface Props {
  balance: string;
  decimals: number;
  nextStep: (amount: string) => void;
}

const Form: FC<Props> = ({ balance, decimals, nextStep }) => {
  const { t } = useTranslation("common");

  const displayBalanceStr = formatUnits(balance, decimals);
  const [amount, setAmount] = useState<string>(displayBalanceStr);

  const invalidAmountError = Error(t("v2.farms.invalidAmount"));
  const [error, setError] = useState<Error | undefined>();

  const validate = (value: string) => {
    if (!value) {
      setError(invalidAmountError);
      return;
    }

    const valueBN = parseUnits(value, decimals);

    const isValid = valueBN.gt(0) && valueBN.lte(BigNumber.from(balance));

    isValid ? setError(undefined) : setError(invalidAmountError);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setAmount(value);
    validate(value);
  };

  const handleFormSubmit = () => {
    if (error) return;

    nextStep(amount);
  };

  return (
    <>
      <div className="bg-background-lightest rounded-xl px-4 py-2 mb-6">
        <div className="flex justify-between mb-2">
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.balances.amount")}
          </p>
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.balances.balance")}: {displayBalanceStr}
          </p>
        </div>

        <div className="flex justify-between">
          <input
            type="number"
            className="w-3/5 bg-transparent focus:outline-none flex-shrink-0 font-medium text-primary leading-7"
            value={amount}
            onChange={handleChange}
          />
          <Button
            size="small"
            onClick={() => {
              setAmount(displayBalanceStr);
              validate(displayBalanceStr);
            }}
          >
            {t("v2.balances.max")}
          </Button>
        </div>
      </div>
      <div className="mb-5">
        <AmountSteps
          setTransactionAmount={(amountShare) =>
            setAmount(
              formatUnits(
                BigNumber.from(balance)
                  .mul((amountShare * 100).toString())
                  .div(100)
                  .toString(),
                decimals,
              ),
            )
          }
        />
      </div>
      <ErrorMessage error={error} />
      <Button state={error ? "disabled" : "enabled"} onClick={handleFormSubmit}>
        {t("v2.actions.confirm")}
      </Button>
    </>
  );
};

export default Form;
