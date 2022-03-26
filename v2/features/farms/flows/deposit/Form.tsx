import { ChangeEvent, FC, useState } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import ErrorMessage from "../Error";

interface Props {
  depositTokenBalance: number;
  nextStep: (amount: string) => void;
}

const Form: FC<Props> = ({ depositTokenBalance, nextStep }) => {
  const { t } = useTranslation("common");
  const [amount, setAmount] = useState<string>(depositTokenBalance.toString());

  const invalidAmountError = Error(t("v2.farms.invalidAmount"));
  const [error, setError] = useState<Error | undefined>();

  const validate = (value: string) => {
    if (!value) {
      setError(invalidAmountError);
      return;
    }

    const amount = parseFloat(value);
    const isValid = amount > 0 && amount <= depositTokenBalance;

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
            {t("v2.balances.balance")}: {depositTokenBalance}
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
              setAmount(depositTokenBalance.toString());
              validate(depositTokenBalance.toString());
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

export default Form;
