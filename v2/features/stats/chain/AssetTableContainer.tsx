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
      <div className="bg-background-light w-full min-w-min rounded-xl border border-foreground-alt-500 shadow mb-5">
        <h2 className="font-body font-bold text-xl p-4">{t("v2.stats.chain.assetTableTitle")}</h2>
        <div className="max-h-[550px] overflow-y-auto p-4">
          <AssetTable assets={assets} core={core} />
        </div>
      </div>
    );
  return null;
};

export default AssetTableContainer;
