import React, { FC } from "react";
import { ChainData } from "v2/types";
import { useTranslation } from "next-i18next";
import AssetTable from "./AssetTable";
import { PickleModelJson } from "picklefinance-core";

const AssetTableContainer: FC<{
  chainData: ChainData;
  core: PickleModelJson.PickleModelJson | undefined;
}> = ({ chainData, core }) => {
  const { t } = useTranslation("common");
  const assets = chainData.assets ? chainData.assets : undefined;
  if (assets && core)
    return (
      <div className="bg-background-light min-w-min max-h-[500px] overflow-y-scroll rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
        <h2 className="font-body font-bold text-xl mb-5">{t("v2.stats.chain.assetTableTitle")}</h2>
        <AssetTable assets={assets} core={core} />
      </div>
    );
  return null;
};

export default AssetTableContainer;
