import { FC } from "react";
import { useTranslation } from "next-i18next";
import dayjs from "dayjs";

import Button from "v2/components/Button";
import Error from "v2/features/farms/flows/Error";
import Spinner from "v2/components/Spinner";
import { classNames, formatDollars } from "v2/utils";
import MoreInfo from "v2/components/MoreInfo";

interface Props {
  error: Error | undefined;
  sendTransaction: () => void;
  tokenName: string;
  amount: string;
  depositTokenPrice: number | undefined;
  isWaiting: boolean;
  previousStep: () => void;
  lockEnd?: Date | undefined;
}

const AwaitingConfirmation: FC<Props> = ({
  error,
  sendTransaction,
  tokenName,
  amount,
  depositTokenPrice,
  isWaiting,
  previousStep,
  lockEnd = null,
}) => {
  const { t } = useTranslation("common");
  const title = lockEnd ? t("v2.dill.confirmLock") : t("v2.farms.confirmDeposit");
  const valueUSD = parseFloat(amount) * (depositTokenPrice || 0);

  return (
    <>
      <div className="flex justify-center my-2">
        <div className="w-1/2 min-h-[200px]">
          <img
            src="/animations/working.gif"
            alt={t("v2.prompts.pleaseConfirm")}
            title={t("v2.prompts.pleaseConfirm")}
          />
        </div>
      </div>
      <h2 className="text-foreground-alt-100 font-title text-lg mt-6 mb-4">{title}</h2>
      <p className="text-foreground-alt-200 text-sm mb-4">
        <span className="font-title text-primary text-base mr-2">{amount}</span>
        {tokenName}
        {valueUSD && (
          <MoreInfo>
            <span className="text-foreground-alt-200 text-sm">{`~ ${formatDollars(
              valueUSD,
            )}`}</span>
          </MoreInfo>
        )}
      </p>
      {lockEnd && (
        <p className="text-foreground-alt-200 text-sm mb-4">
          {t("v2.dill.lockingUntil")}{" "}
          <span className="font-title text-primary text-base mr-2">
            {dayjs(lockEnd).format("LL")}
          </span>
        </p>
      )}
      <Error error={error} />
      <div className="flex justify-center items-center pt-4">
        <Button type="secondary" onClick={previousStep} className="mr-3">
          {t("v2.actions.back")}
        </Button>
        <Button
          onClick={sendTransaction}
          state={isWaiting ? "disabled" : "enabled"}
          className={classNames(isWaiting && "p-3")}
        >
          {isWaiting && (
            <div className="w-5 h-5 mr-3">
              <Spinner />
            </div>
          )}
          {lockEnd ? t("v2.actions.lock") : t("v2.actions.deposit")}
        </Button>
      </div>
    </>
  );
};

export default AwaitingConfirmation;
