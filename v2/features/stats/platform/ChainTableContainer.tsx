import { useTranslation } from "next-i18next";
import { FC } from "react";
import { PlatformChainData } from "v2/types";
import ChainTable from "./ChainTable";

const ChainTableContainer: FC<{ chains: PlatformChainData }> = ({ chains }) => {
  const { t } = useTranslation("common");
  return (
    <div className="bg-background-light min-w-min rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
      <h2 className="font-body font-bold text-xl">{t("v2.stats.platform.chainTableTitle")}</h2>
      <br />
      <ChainTable chains={chains} />
    </div>
  );
};

export default ChainTableContainer;
