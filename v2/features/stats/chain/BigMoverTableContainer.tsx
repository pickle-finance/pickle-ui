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
        "bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 mb-5 sm:p-8",
        className,
      )}
    >
      <h2 className="font-body font-bold text-xl">{t(`v2.stats.chain.${type}Table`)}</h2>
      <br />
      {type === "tvl" && (
        <div className="grid grid-cols-2 gap-4 pt-2 pb-2">
          <div>
            <TvlGainsTable data={tableData} />
          </div>
          <div>
            <TvlLossesTable data={tableData} />
          </div>
        </div>
      )}
      {type === "tokenPct" && (
        <div className="grid grid-cols-2 gap-4 pt-2 pb-2">
          <div>
            <TokenGainsTable data={tableData} />
          </div>
          <div>
            <TokenLossesTable data={tableData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BigMoverTableContainer;
