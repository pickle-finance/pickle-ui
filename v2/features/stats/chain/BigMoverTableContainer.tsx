import React, { FC } from "react";
import { useTranslation } from "next-i18next";
import { GainsTable, LossesTable,  } from "./BigMoverTables";
import { iTokenPriceChange } from "pages/v2/stats/chain";

const BigMoverTableContainer: FC<{ type: string, tableData: iTokenPriceChange[]}> = ({ type, tableData }) => {
  const { t } = useTranslation("common");

  return (
    <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 mb-5 sm:p-8">
      <h2 className="font-body font-bold text-xl">{t("v2.stats.chain.assetTableTitle")}</h2>
      <br />
      {type==="pct" && 
        <span>
          <GainsTable data={tableData}/>
          <LossesTable data={tableData} />
        </span>
      }
      {type==="bal" && 
        <span>
          <GainsTable data={tableData}/>
          <LossesTable data={tableData} />
        </span>
      }
    </div>
  );
};

export default BigMoverTableContainer;