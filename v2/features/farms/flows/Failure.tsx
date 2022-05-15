import { FC } from "react";
import { useTranslation } from "next-i18next";

import { shortenAddress } from "v2/utils";
import Link from "v2/components/Link";
import Button from "v2/components/Button";

interface Props {
  txHash: string | undefined;
  chainExplorer: string | undefined;
  retry: () => void;
}

const Failure: FC<Props> = ({ retry, txHash, chainExplorer }) => {
  const { t } = useTranslation("common");

  const title = t("v2.farms.transactionFailed");
  const txUrl = `${chainExplorer}/tx/${txHash}`;

  return (
    <>
      <div className="flex justify-center mt-2">
        <div className="w-1/2 min-h-[200px]">
          <img src="/animations/failure.gif" alt={title} title={title} />
        </div>
      </div>
      <h2 className="text-foreground-alt-100 font-title text-lg mb-6">{title}</h2>
      <div className="flex items-center justify-center space-x-3 mb-6">
        <Link href={txUrl} external primary className="grow-0">
          {shortenAddress(txHash || "")}
        </Link>
      </div>
      <Button onClick={retry}>{t("v2.actions.retry")}</Button>
    </>
  );
};

export default Failure;
