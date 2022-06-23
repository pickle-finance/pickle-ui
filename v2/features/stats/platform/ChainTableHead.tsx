import { useTranslation } from "next-i18next";
import { FC } from "react";

const ChainHead: FC = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="rounded-t-md">
      <tr className="w-full border border-foreground-alt-400 bg-foreground-alt-400 text-foreground-alt-200">
        <th scope="col" className="text-left text-sm lg:pl-8 sm:pl-4 py-2 pr-2">
          {t("v2.stats.platform.chainTableHeaders.chain")}
        </th>
        <th scope="col" className="text-left text-sm p-2">
          {t("v2.stats.platform.chainTableHeaders.currentRevs")}
        </th>
        <th scope="col" className="text-left text-sm p-2">
          {t("v2.stats.platform.chainTableHeaders.revsChange")}
        </th>
        <th scope="col" className="text-left text-sm p-2">
          {t("v2.stats.platform.chainTableHeaders.tvl")}
        </th>
        <th scope="col" className="text-left text-sm p-2">
          {t("v2.stats.platform.chainTableHeaders.tvlChange")}
        </th>
      </tr>
    </thead>
  );
};

export default ChainHead;
