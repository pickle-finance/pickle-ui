import React, { FC } from "react";
import { ChainData, SetFunction } from "v2/types";
import { useTranslation } from "next-i18next";
import AssetTable from "./AssetTable";
import { PickleModelJson } from "picklefinance-core";
import { ChainSelectData } from "../ChainSelect";

const AssetTableContainer: FC<{
  chainData: ChainData;
  setJar: SetFunction;
  chain: ChainSelectData;
  core: PickleModelJson.PickleModelJson | undefined;
}> = ({ chainData, setJar, chain, core }) => {
  const { t } = useTranslation("common");
  const assets = chainData.assets ? chainData.assets : undefined;
  if (assets && core)
    return (
      <div className="bg-background-light w-full min-w-min rounded-xl border border-foreground-alt-500 shadow mb-5">
        <h2 className="font-body font-bold text-xl text-foreground-alt-200 p-4">
          {t("v2.stats.chain.assetTableTitle")}
        </h2>
        <div className="p-2 pb-4">
          <div className="max-h-[550px] overflow-y-auto p-2">
            <AssetTable assets={assets} setJar={setJar} chain={chain} core={core} />
          </div>
        </div>
      </div>
    );
  return null;
};

export default AssetTableContainer;
