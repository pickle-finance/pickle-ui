import { FC } from "react";
import { useTranslation } from "next-i18next";

import { shortenAddress } from "v2/utils";
import Link from "v2/components/Link";
import Ping from "v2/features/connection/Ping";
import Image from "next/image";

interface Props {
  txHash: string | undefined;
  chainExplorer: string | undefined;
}

const AwaitingReceipt: FC<Props> = ({ txHash, chainExplorer }) => {
  const { t } = useTranslation("common");

  const title = t("v2.farms.waitingToBeProcessed");
  const txUrl = `${chainExplorer}/tx/${txHash}`;

  return (
    <>
      <div className="flex justify-center my-2">
        <div className="w-1/2 min-h-[200px]">
          <Image src="/animations/waiting.gif" alt={title} title={title} fill />
        </div>
      </div>
      <h2 className="text-foreground-alt-100 font-title text-lg my-6">{title}</h2>
      <div className="flex items-center justify-center space-x-3">
        <Ping />
        <Link href={txUrl} external primary className="grow-0">
          {shortenAddress(txHash || "")}
        </Link>
      </div>
    </>
  );
};

export default AwaitingReceipt;
