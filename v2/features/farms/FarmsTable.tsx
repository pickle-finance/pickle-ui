import { FC } from "react";
import { useTranslation } from "next-i18next";

import FarmsTableBody from "./FarmsTableBody";

const FarmsTableHeaderCell: FC = ({ children }) => (
  <th
    scope="col"
    className="px-4 py-1 text-left text-xs font-bold text-gray-light tracking-normal sm:px-6"
  >
    {children}
  </th>
);

interface Props {
  simple?: boolean;
  title: string;
}

const FarmsTable: FC<Props> = ({ simple, title }) => {
  const { t } = useTranslation("common");

  return (
    <>
      <h2 className="font-body font-bold text-xl mb-6">{title}</h2>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto">
          <div className="py-2 align-middle inline-block min-w-full">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-black uppercase">
                <tr>
                  <FarmsTableHeaderCell>
                    {t("v2.farms.asset")}
                  </FarmsTableHeaderCell>
                  <FarmsTableHeaderCell>
                    {t("v2.farms.earned")}
                  </FarmsTableHeaderCell>
                  <FarmsTableHeaderCell>
                    {t("v2.farms.deposited")}
                  </FarmsTableHeaderCell>
                  <FarmsTableHeaderCell>
                    {t("v2.farms.apy")}
                  </FarmsTableHeaderCell>
                  <FarmsTableHeaderCell>
                    {t("v2.farms.liquidity")}
                  </FarmsTableHeaderCell>
                  {/* Chevron down/up column */}
                  {!simple && <FarmsTableHeaderCell></FarmsTableHeaderCell>}
                </tr>
              </thead>
              <tbody className="text-white">
                <FarmsTableBody simple={simple} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default FarmsTable;
