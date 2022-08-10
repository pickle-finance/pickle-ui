import { FC } from "react";
import { useTranslation } from "next-i18next";

import FarmsTableBody from "./FarmsTableBody";
import FarmControls from "./FarmControls";
import FarmsTableHeaderCellSortable from "./FarmsTableHeaderCellSortable";
import { SortType } from "v2/store/controls";
import { AssetWithData } from "v2/store/core";
import Pagination from "./Pagination";

interface Props {
  requiresUserModel?: boolean;
  simple?: boolean;
  dashboard?: boolean;
  title?: string;
  singleAsset?: AssetWithData;
  hideDescription?: boolean;
}

const FarmsTable: FC<Props> = ({
  simple,
  dashboard,
  title,
  requiresUserModel,
  singleAsset,
  hideDescription,
}) => {
  const { t } = useTranslation("common");
  return (
    <>
      {title && <h2 className="font-body font-bold text-xl mb-6">{title}</h2>}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto">
          <div className="py-2 align-middle inline-block min-w-full">
            {!simple && !singleAsset && !dashboard && <FarmControls />}
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-background uppercase">
                <tr>
                  <FarmsTableHeaderCellSortable
                    sortType={SortType.None}
                    label={t("v2.farms.asset")}
                  />

                  <FarmsTableHeaderCellSortable
                    sortType={singleAsset ? SortType.None : SortType.Earned}
                    label={t("v2.farms.earned")}
                  />

                  <FarmsTableHeaderCellSortable
                    sortType={singleAsset ? SortType.None : SortType.Deposited}
                    label={t("v2.farms.deposited")}
                  />

                  <FarmsTableHeaderCellSortable
                    sortType={singleAsset ? SortType.None : SortType.Apy}
                    label={t("v2.farms.apy")}
                  />

                  <FarmsTableHeaderCellSortable
                    sortType={singleAsset ? SortType.None : SortType.Liquidity}
                    label={t("v2.farms.liquidity")}
                  />
                  {/* Chevron down/up column */}
                </tr>
              </thead>
              <tbody className="text-foreground">
                <FarmsTableBody
                  simple={simple}
                  dashboard={dashboard}
                  requiresUserModel={requiresUserModel}
                  singleAsset={singleAsset}
                  hideDescription={hideDescription}
                />
              </tbody>
            </table>
            {!simple && !singleAsset && !dashboard && (
              <div className="flex justify-center mt-4">
                <Pagination />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FarmsTable;
