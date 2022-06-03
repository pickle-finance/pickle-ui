import { VFC } from "react";
import { useTranslation } from "next-i18next";
import { InformationCircleIcon } from "@heroicons/react/solid";

import { AssetWithData, BrineryWithData } from "v2/store/core";
import { isAcceptingDeposits } from "v2/store/core.helpers";

interface Props {
  asset: AssetWithData | BrineryWithData;
}

const FarmAdditionalInfo: VFC<Props> = ({ asset }) => {
  const { t } = useTranslation("common");

  let message: string | undefined = undefined;
  if (!isAcceptingDeposits(asset)) message = t("v2.farms.withdrawOnly");
  if (asset.protocol === "B.Protocol") message = t("v2.farms.bProtocolInfo");

  if (!message) return null;

  return (
    <div className="flex justify-center text-foreground-alt-200 text-sm mt-1 mb-6">
      <InformationCircleIcon className="w-5 h-5 text-accent mr-2" />
      {message}
    </div>
  );
};

export default FarmAdditionalInfo;
