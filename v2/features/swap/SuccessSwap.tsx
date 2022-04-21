import { FC } from "react";
import { useTranslation } from "next-i18next";

import { shortenAddress } from "v2/utils";
import Link from "v2/components/Link";
import Button from "v2/components/Button";

interface Props {
  orderId: string | undefined;
  explorer: string | undefined;
  closeModal: () => void;
}

const SuccessSwap: FC<Props> = ({ closeModal, orderId, explorer }) => {
  const { t } = useTranslation("common");

  const title = t("v2.swap.success");
  const txUrl = `${explorer}/orders/${orderId}`;

  return (
    <>
      <div className="flex justify-center my-2 text-4xl">🎉</div>
      <h2 className="text-foreground-alt-100 font-title text-lg my-6">{title}</h2>
      <div className="flex items-center justify-center space-x-3 mb-6">
        <Link href={txUrl} external primary className="grow-0">
          {shortenAddress(orderId || "")}
        </Link>
      </div>
      <Button onClick={closeModal}>{t("v2.actions.close")}</Button>
    </>
  );
};

export default SuccessSwap;
