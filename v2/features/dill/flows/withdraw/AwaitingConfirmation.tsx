import { FC } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import Error from "v2/features/farms/flows/Error";
import Spinner from "v2/components/Spinner";
import { classNames } from "v2/utils";
import Image from "next/image";

interface Props {
  error: Error | undefined;
  sendTransaction: () => void;
  isWaiting: boolean;
  previousStep: () => void;
}

const AwaitingConfirmation: FC<Props> = ({ error, sendTransaction, isWaiting, previousStep }) => {
  const { t } = useTranslation("common");
  const title = t("v2.dill.confirmWithdraw");

  return (
    <>
      <div className="flex justify-center my-2">
        <div className="w-1/2 min-h-[200px]">
          <Image
            src="/animations/working.gif"
            alt={t("v2.prompts.pleaseConfirm")}
            title={t("v2.prompts.pleaseConfirm")}
            height="200px"
            width="200px"
            loading="eager"
          />
        </div>
      </div>
      <h2 className="text-foreground-alt-100 font-title text-lg mt-6 mb-4">{title}</h2>
      {/* <p className="text-foreground-alt-200 text-sm mb-4">
        <span className="font-title text-primary text-base mr-2">{amount}</span>
        {tokenName}
        {valueUSD && (
          <MoreInfo>
            <span className="text-foreground-alt-200 text-sm">{`~ ${formatDollars(
              valueUSD,
            )}`}</span>
          </MoreInfo>
        )}
      </p> */}
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
          {`${t("v2.actions.withdraw")} PICKLEs`}
        </Button>
      </div>
    </>
  );
};

export default AwaitingConfirmation;
