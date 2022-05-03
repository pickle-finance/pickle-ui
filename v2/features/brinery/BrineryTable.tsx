import { FC } from "react";
import { useTranslation } from "next-i18next";

import FarmsTableBody from "../farms/FarmsTableBody";
import FarmControls from "../farms/FarmControls";
import FarmsTableHeaderCellSortable from "../farms/FarmsTableHeaderCellSortable";
import { SortType } from "v2/store/controls";
import { JarWithData } from "v2/store/core";
import Pagination from "../farms/Pagination";

interface Props {
  requiresUserModel?: boolean;
  simple?: boolean;
  title?: string;
  asset?: JarWithData;
  singleAsset?: boolean;
  hideDescription?: boolean;
}

const BrineryTable: FC<Props> = ({
  simple,
  title,
  requiresUserModel,
  asset,
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
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-background uppercase">
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

                  <FarmsTableHeaderCellSortable sortType={SortType.Apy} label={t("v2.farms.apy")} />

                  <FarmsTableHeaderCellSortable
                    sortType={SortType.Liquidity}
                    label={t("v2.farms.liquidity")}
                  />
                  {/* Chevron down/up column */}
                </tr>
              </thead>
              <tbody className="text-foreground">
                <FarmsTableBody
                  simple={simple}
                  requiresUserModel={requiresUserModel}
                  asset={asset}
                  hideDescription={hideDescription}
                  isBrinery={true}
                />
              </tbody>
            </table>
            {!simple && !singleAsset && (
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

export default BrineryTable;
