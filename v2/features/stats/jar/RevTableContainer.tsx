import { PickleModelJson } from "picklefinance-core";
import React, { FC } from "react";
import { AssetRevs } from "v2/types";
import { useTranslation } from "next-i18next";
import RevTable from "./RevTable";

const RevTableContainer: FC<{
  revs: AssetRevs;
  pfCore: PickleModelJson.PickleModelJson;
}> = ({ revs, pfCore }) => {
  const { t } = useTranslation("common");
  const chainExplorer: string = pfCore ? getChainExplorer(revs, pfCore) : "";
  return (
    <div className="bg-background-light min-w-min rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
      <h2 className="font-body font-bold text-xl text-foreground-alt-200">
        {t("v2.stats.jar.revsTableTitle")}
      </h2>
      <br />
      <RevTable revs={revs} chainExplorer={chainExplorer} />
    </div>
  );
};

const getChainExplorer = (revs: AssetRevs, pfCore: PickleModelJson.PickleModelJson): string => {
  if (revs.recentHarvests.length > 0) {
    const jarKey = revs.recentHarvests[0].jarKey;
    const chain =
      pfCore && pfCore.assets && pfCore.assets.jars
        ? pfCore.assets.jars.filter((x) => x.details && x.details.apiKey === jarKey)[0].chain
        : "";
    const chainExplorer =
      pfCore && pfCore.chains ? pfCore.chains.filter((x) => x.network === chain)[0].explorer : "";
    return chainExplorer;
  }
  return "";
};

export default RevTableContainer;
