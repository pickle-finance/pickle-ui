import { FC } from "react";
import { useTranslation } from "next-i18next";

import { shortenAddress } from "v2/utils";
import Link from "v2/components/Link";
import Button from "v2/components/Button";
import Image from "next/image";

interface Props {
  txHash: string | undefined;
  chainExplorer: string | undefined;
  closeModal: () => void;
}

const Success: FC<Props> = ({ closeModal, txHash, chainExplorer }) => {
  const { t } = useTranslation("common");

  const title = t("v2.farms.success");
  const txUrl = `${chainExplorer}/tx/${txHash}`;

  return (
    <>
      <div className="flex justify-center mt-2">
        <div className="w-1/2 min-h-[200px]">
          <Image
            src="/animations/success.gif"
            alt={title}
            title={title}
            width={0}
            height={0}
            style={{ width: "200px", height: "auto" }}
          />
        </div>
      </div>
      <h2 className="text-foreground-alt-100 font-title text-lg mb-6">{title}</h2>
      <div className="flex items-center justify-center space-x-3 mb-6">
        <Link href={txUrl} external primary className="grow-0">
          {shortenAddress(txHash || "")}
        </Link>
      </div>
      <Button onClick={closeModal}>{t("v2.actions.close")}</Button>
    </>
  );
};

export default Success;
