import { FC } from "react";
import { useTranslation } from "next-i18next";

import { shortenAddress } from "v2/utils";
import Link from "v2/components/Link";
import Ping from "v2/features/connection/Ping";

interface Props {
  orderId: string;
  explorer: string;
}

const PendingSwapOrder: FC<Props> = ({ orderId, explorer }) => {
  const { t } = useTranslation("common");

  const title = t("v2.swap.waitingToBeProcessed");
  const txUrl = `${explorer}/orders/${orderId}`;

  return (
    <>
      <div className="flex justify-center my-2">
        <div className="w-1/2 min-h-[200px]">
          <img src="/animations/waiting.gif" alt={title} title={title} />
        </div>
      </div>
      <h2 className="text-foreground-alt-100 font-title text-lg my-6">{title}</h2>
      <div className="flex items-center justify-center space-x-3">
        <Ping />
        <Link href={txUrl} external primary className="grow-0">
          {shortenAddress(orderId || "")}
        </Link>
      </div>
    </>
  );
};

export default PendingSwapOrder;
