import React, { FC } from "react";
import { useTranslation } from "next-i18next";
import { TokenGainsTable, TokenLossesTable, TvlGainsTable, TvlLossesTable } from "./BigMoverTables";
import { iBigMoverTableData } from "./BigMoverUtils";
import { classNames } from "v2/utils";

const BigMoverTableContainer: FC<{
  type: "tvl" | "tokenPct";
  tableData: iBigMoverTableData[];
  className?: string;
}> = ({ type, tableData, className }) => {
  const { t } = useTranslation("common");

  return (
    <div
      className={classNames(
        "bg-background-light min-w-min rounded-xl border border-foreground-alt-500 shadow p-4 mb-5 sm:p-8",
        className,
      )}
    >
      <h2 className="font-body font-bold text-xl mb-4">{t(`v2.stats.chain.${type}Table`)}</h2>
      {type === "tvl" && (
        <div className="grid grid-cols-2 grid-flow-row-dense gap-4">
          <TvlGainsTable data={tableData} />
          <TvlLossesTable data={tableData} />
        </div>
      )}
      {type === "tokenPct" && (
        <div className="grid grid-cols-2 gap-4">
          <TokenGainsTable data={tableData} />
          <TokenLossesTable data={tableData} />
        </div>
      )}
    </div>
  );
};

export default BigMoverTableContainer;
