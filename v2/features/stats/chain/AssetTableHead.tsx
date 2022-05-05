import { useTranslation } from "next-i18next";
import { FC } from "react";

const AssetTableHead: FC = () => {
  const { t } = useTranslation("common");
  return (
    <thead className="rounded-t-md">
      <tr className="w-full border border-foreground-alt-400 bg-foreground-alt-400">
        <th scope="col" className="w-1/4 text-left pl-10 pt-2 pb-2">
          {t("v2.stats.chain.assetTableHeaders.asset")}
        </th>
        <th scope="col" className="w-1/4 text-left pl-10 pt-2 pb-2">
          {t("v2.stats.chain.assetTableHeaders.tvl")}
        </th>
        <th scope="col" className="w-1/4 text-left pl-10 pt-2 pb-2">
          {t("v2.stats.chain.assetTableHeaders.tvlChange")}
        </th>
        <th scope="col" className="w-1/4 text-left pl-10 pt-2 pb-2">
          {t("v2.stats.chain.assetTableHeaders.apyRange")}
        </th>
      </tr>
    </thead>
  );
};

export default AssetTableHead;
