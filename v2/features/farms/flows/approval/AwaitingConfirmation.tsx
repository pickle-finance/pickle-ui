import { FC } from "react";
import { useTranslation } from "next-i18next";
import { PencilIcon } from "@heroicons/react/outline";

import Button from "v2/components/Button";
import Error from "../Error";
import Spinner from "v2/components/Spinner";
import { classNames } from "v2/utils";

interface Props {
  error: Error | undefined;
  sendTransaction: () => void;
  tokenName: string;
  isWaiting: boolean;
}

const AwaitingConfirmation: FC<Props> = ({ error, sendTransaction, tokenName, isWaiting }) => {
  const { t } = useTranslation("common");

  const title = t("v2.farms.givePermission", { token: tokenName });

  return (
    <>
      <div className="flex justify-center my-10">
        <PencilIcon className="w-20 h-20 text-primary" />
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
        {t("v2.actions.approve")}
      </Button>
    </>
  );
};

export default AwaitingConfirmation;
