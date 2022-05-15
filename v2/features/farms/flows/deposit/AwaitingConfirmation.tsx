import { FC } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import Error from "../Error";
import Spinner from "v2/components/Spinner";
import { classNames } from "v2/utils";
import MoreInfo from "v2/components/MoreInfo";

interface Props {
  amount: string;
  cta: string;
  error: Error | undefined;
  equivalentValue?: string | undefined;
  isWaiting: boolean;
  previousStep: () => void;
  sendTransaction: () => void;
  title: string;
  tokenName: string | undefined;
}

const AwaitingConfirmation: FC<Props> = ({
  amount,
  cta,
  equivalentValue,
  error,
  isWaiting,
  previousStep,
  sendTransaction,
  title,
  tokenName,
}) => {
  const { t } = useTranslation("common");

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
      <p className="text-foreground-alt-200 text-sm mb-8">
        <span className="font-title text-primary text-base mr-2">{amount}</span>
        {tokenName}
        {equivalentValue && (
          <MoreInfo>
            <span className="text-foreground-alt-200 text-sm">{equivalentValue}</span>
          </MoreInfo>
        )}
      </p>
      <Error error={error} />
      <div className="flex justify-center items-center">
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
          {cta}
        </Button>
      </div>
    </>
  );
};

export default AwaitingConfirmation;
