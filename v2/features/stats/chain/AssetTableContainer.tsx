import React, { FC } from "react";
import { ChainAssetData } from "v2/types";
import { useTranslation } from "next-i18next";
import AssetTable from "./AssetTable";

const AssetTableContainer: FC<{ assets: ChainAssetData }> = ({ assets }) => {
  const { t } = useTranslation("common");
  return (
    <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
      <h2 className="font-body font-bold text-xl">{t("v2.stats.chain.assetTableTitle")}</h2>
      <br />
      <AssetTable assets={assets} />
    </div>
  );
};

export default AssetTableContainer;