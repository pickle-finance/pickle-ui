import { FC, ReactNode } from "react";
import { useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import Error from "./Error";
import Spinner from "v2/components/Spinner";
import { classNames } from "v2/utils";

interface Props {
  error: Error | undefined;
  sendTransaction: () => void;
  title: string | ReactNode;
  isWaiting: boolean;
  cta: string;
}

const AwaitingConfirmationNoUserInput: FC<Props> = ({
  cta,
  error,
  sendTransaction,
  title,
  isWaiting,
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
      <h2 className="text-foreground-alt-100 font-title text-lg my-6">{title}</h2>
      <Error error={error} />
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
    </>
  );
};

export default AwaitingConfirmationNoUserInput;
