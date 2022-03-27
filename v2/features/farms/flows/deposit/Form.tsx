import { FC } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";

interface Props {
  tokenBalance: number;
}

const Form: FC<Props> = ({ tokenBalance }) => {
  const { t } = useTranslation("common");

  return (
    <>
      <div className="bg-background-lightest rounded-xl px-4 py-2 mb-6">
        <div className="flex justify-between mb-2">
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.balances.amount")}
          </p>
          <p className="font-bold text-foreground-alt-300 text-xs tracking-normal leading-4">
            {t("v2.balances.balance")}: {tokenBalance}
          </p>
        </div>

        <div className="flex justify-between">
          <input
            type="number"
            className="w-3/5 bg-transparent focus:outline-none flex-shrink-0 font-medium text-primary leading-7"
          />
          <Button size="small">{t("v2.balances.max")}</Button>
        </div>
      </div>
      <Button>{t("v2.actions.confirm")}</Button>
    </>
  );
};

export default Form;
