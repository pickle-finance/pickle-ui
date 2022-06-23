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
  if (tableData.length > 0)
    return (
      <div
        className={classNames(
          "bg-background-light min-w-min rounded-xl border border-foreground-alt-500 shadow p-4 mb-5 sm:p-8",
          className,
        )}
      >
        <h2 className="text-foreground-alt-200 font-body font-bold text-xl mb-4">
          {t(`v2.stats.chain.${type}Table`)}
        </h2>
        {type === "tvl" && (
          <div className="xl:columns-2 lg:columns-2 md:columns-1 sm:columns-1 gap-4">
            <TvlGainsTable data={tableData} />
            <TvlLossesTable data={tableData} />
          </div>
        )}
        {type === "tokenPct" && (
          <div className="xl:columns-2 lg:columns-2 md:columns-1 sm:columns-1 gap-4">
            <TokenGainsTable data={tableData} />
            <TokenLossesTable data={tableData} />
          </div>
        )}
      </div>
    );
  return null;
};

export default BigMoverTableContainer;
