import { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import FarmsTableBody from "./FarmsTableBody";
import FarmControls from "./FarmControls";
import FarmsTableHeaderCellSortable from "./FarmsTableHeaderCellSortable";
import { SortType } from "v2/store/controls";

interface Props {
  requiresUserModel?: boolean;
  simple?: boolean;
  title: string;
}

const FarmsTable: FC<Props> = ({ simple, title, requiresUserModel }) => {
  const { t } = useTranslation("common");

  return (
    <>
      <h2 className="font-body font-bold text-xl mb-6">{title}</h2>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto">
          <div className="py-2 align-middle inline-block min-w-full">
            {!simple && <FarmControls />}
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-black uppercase">
                <tr>
                  <FarmsTableHeaderCellSortable
                    sortType={SortType.None}
                    label={t("v2.farms.asset")}
                  />

                  <FarmsTableHeaderCellSortable
                    sortType={SortType.Earned}
                    label={t("v2.farms.earned")}
                  />

                  <FarmsTableHeaderCellSortable
                    sortType={SortType.Deposited}
                    label={t("v2.farms.deposited")}
                  />

                  <FarmsTableHeaderCellSortable
                    sortType={SortType.Apy}
                    label={t("v2.farms.apy")}
                  />

                  <FarmsTableHeaderCellSortable
                    sortType={SortType.Liquidity}
                    label={t("v2.farms.liquidity")}
                  />
                  {/* Chevron down/up column */}
                </tr>
              </thead>
              <tbody className="text-white">
                <FarmsTableBody
                  simple={simple}
                  requiresUserModel={requiresUserModel}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default FarmsTable;
