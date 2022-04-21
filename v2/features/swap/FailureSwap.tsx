import { FC } from "react";
import { useTranslation } from "next-i18next";

import { shortenAddress } from "v2/utils";
import Link from "v2/components/Link";
import Button from "v2/components/Button";

interface Props {
  orderId: string | undefined;
  explorer: string | undefined;
  message: string | undefined;
  retry: () => void;
}

const FailureSwap: FC<Props> = ({ retry, orderId, explorer, message }) => {
  const { t } = useTranslation("common");

  const title = t("v2.swap.swapFailed");
  const txUrl = `${explorer}/orders/${orderId}`;

  return (
    <>
      <div className="flex justify-center my-2 text-4xl">😭</div>
      <h2 className="text-foreground-alt-100 font-title text-lg my-6">{title}</h2>
      <div className="flex items-center justify-center space-x-3 mb-6">
        {message ? (
          <div className="text-foreground-alt-100">{t("v2.swap.pleaseTryAgain", { message })}</div>
        ) : (
          <Link href={txUrl} external primary className="grow-0">
            {shortenAddress(orderId || "")}
          </Link>
        )}
      </div>
      {!message && <Button onClick={retry}>{t("v2.actions.retry")}</Button>}
    </>
  );
};

export default FailureSwap;
