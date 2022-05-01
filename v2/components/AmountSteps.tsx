import { useState, VFC } from "react";
import { classNames, formatPercentage } from "v2/utils";

const steps = [{ value: 0.25 }, { value: 0.5 }, { value: 0.75 }, { value: 1 }];

interface Props {
  setTransactionAmount: (amountShare: number) => void;
}

const AmountSteps: VFC<Props> = ({ setTransactionAmount }) => {
  const [amountShare, setAmountShare] = useState<number>(1);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex space-x-2">
        {steps.map((step) => (
          <li key={step.value} className="flex-1">
            <a
              onClick={() => {
                setAmountShare(step.value);
                setTransactionAmount(step.value);
              }}
              className={classNames(
                "flex justify-end cursor-pointer border-t-4 pt-2 transition duration-300 ease-in-out",
                step.value < amountShare && "border-primary hover:border-primary-light",
                step.value === amountShare && "border-primary",
                step.value > amountShare && "border-background-lightest hover:border-primary-light",
              )}
            >
              <span className="text-xs text-foreground-alt-200 font-semibold tracking-wide uppercase">
                {formatPercentage(step.value * 100, 0)}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default AmountSteps;
