import React, { FC } from "react";
import { useTranslation } from "next-i18next";
import { GainsTable, LossesTable,  } from "./BigMoverTables";

const BigMoverTableContainer: FC<{ type: string, tableData: any}> = ({ type, tableData }) => {
  const { t } = useTranslation("common");
  console.log(tableData);
  // define table data interface idiot
  // const sortedData = tableData.sort((a, b) => a < b ? 1 : -1);
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

interface TableData {

}

export default BigMoverTableContainer;