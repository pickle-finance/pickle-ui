import { FC } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import Error from "../Error";
import Spinner from "v2/components/Spinner";
import { classNames } from "v2/utils";
import MoreInfo from "v2/components/MoreInfo";

interface Props {
  amount0: string;
  amount1: string;
  cta: string;
  error: Error | undefined;
  equivalentValue: string | undefined;
  isWaiting: boolean;
  previousStep: () => void;
  sendTransaction: () => void;
  title: string;
  token0Name: string | undefined;
  token1Name: string | undefined;
}

const AwaitingConfirmationUniV3: FC<Props> = ({
  amount0,
  amount1,
  cta,
  equivalentValue,
  error,
  isWaiting,
  previousStep,
  sendTransaction,
  title,
  token0Name,
  token1Name,
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
      <div className="flex justify-center items-center mb-4">
        <span className="text-foreground-alt-200 text-sm mr-3">
          <span className="font-title text-primary text-base mr-2">
            {parseFloat(amount0).toFixed(4)}
          </span>
          {token0Name?.toUpperCase()}
        </span>
        <span className="text-foreground-alt-200 text-sm">
          <span className="font-title text-primary text-base mr-2">
            {parseFloat(amount1).toFixed(4)}
          </span>
          {token1Name?.toUpperCase()}
          {equivalentValue && (
            <MoreInfo>
              <span className="text-foreground-alt-200 text-sm">{equivalentValue}</span>
            </MoreInfo>
          )}
        </span>
      </div>
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

export default AwaitingConfirmationUniV3;
