import { FC } from "react";
import { useTranslation } from "next-i18next";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";

import Button from "v2/components/Button";
import Error from "../Error";
import Spinner from "v2/components/Spinner";
import { classNames } from "v2/utils";

interface Props {
  error: Error | undefined;
  sendTransaction0: () => void;
  sendTransaction1: () => void;
  balances: UserTokenData | undefined;
  isWaiting0: boolean;
  isWaiting1: boolean;
  closeModal: () => void;
}

const UniV3AwaitingConfirmation: FC<Props> = ({
  error,
  sendTransaction0,
  sendTransaction1,
  isWaiting0,
  isWaiting1,
  balances,
  closeModal,
}) => {
  const { t } = useTranslation("common");
  if (!balances)
    return (
      <>
        <div className="font-title mb-2 text-lg text-foreground-alt-200">
          {t("v2.farms.approvalBalanceError")}
        </div>
      </>
    );

  const title = t("v2.farms.givePermissionV3");
  const [token0, token1] = Object.keys(balances.componentTokenBalances);
  const jarAllowedToken0 = parseFloat(balances.componentTokenBalances[token0].allowance || "0") > 0;
  const jarAllowedToken1 = parseFloat(balances.componentTokenBalances[token1].allowance || "0") > 0;

  const userHasJarAllowance = jarAllowedToken0 && jarAllowedToken1;
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

      <div className="grid grid-cols-2">
        <Button
          onClick={sendTransaction0}
          state={isWaiting0 || jarAllowedToken0 ? "disabled" : "enabled"}
          className={classNames(isWaiting0 && "p-3")}
        >
          {isWaiting0 && (
            <div className="w-5 h-5 mr-3">
              <Spinner />
            </div>
          )}
          {t("v2.farms.approveToken", { token: token0.toUpperCase() })}
        </Button>
        <Button
          onClick={sendTransaction1}
          state={isWaiting1 || jarAllowedToken1 ? "disabled" : "enabled"}
          className={classNames(isWaiting1 && "p-3")}
        >
          {isWaiting1 && (
            <div className="w-5 h-5 mr-3">
              <Spinner />
            </div>
          )}
          {t("v2.farms.approveToken", { token: token1.toUpperCase() })}
        </Button>
      </div>
      {userHasJarAllowance && (
        <>
          <h2 className="text-foreground-alt-100 font-title text-lg my-2">
            {t("v2.farms.allApproved")}
          </h2>
          <Button onClick={closeModal}>{t("v2.actions.close")}</Button>
        </>
      )}
    </>
  );
};

export default UniV3AwaitingConfirmation;
