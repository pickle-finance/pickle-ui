import { FC, useState } from "react";
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
  requiresUserModel?: boolean;
  simple?: boolean;
  title: string;
}

const FarmsTable: FC<Props> = ({ simple, title, requiresUserModel }) => {
  const { t } = useTranslation("common");
  const [farmFilter, setFarmFilter] = useState('');
  const SearchBar: FC = ({}) => {
    return (
      <div>  
        <input
          className="bg-black-light h-10 px-5 pr-16 mr-5 mb-5 rounded-lg text-sm focus:outline-none"
          type="text"
          id="farm-search"
          placeholder="Filter Farms"
          value={farmFilter}
          onChange={event => setFarmFilter(event.target.value)}
          name="s" 
        />
      </div>
    );
  }
  return (
    <>
      <h2 className="font-body font-bold text-xl mb-6">{title}</h2>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto">
          <div className="py-2 align-middle inline-block min-w-full">
            <SearchBar />
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
                  {!simple && <FarmsTableHeaderCell />}
                </tr>
              </thead>
              <tbody className="text-white">
                <FarmsTableBody
                  simple={simple}
                  requiresUserModel={requiresUserModel}
                  farmFilter={farmFilter}
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
