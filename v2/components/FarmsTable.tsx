import { FC } from "react";
import { useTranslation } from "next-i18next";
import FarmsTableRow from "./FarmsTableRow";

const farms = [
  {
    asset: "DAI-ETH",
    earned: 520.2,
    deposited: 1300,
    apy: "40-99%",
    liquidity: 1890789,
  },
];

const FarmsTableHeaderCell: FC = ({ children }) => (
  <th
    scope="col"
    className="px-4 py-2 text-left text-xs font-bold text-gray-light tracking-normal sm:px-6"
  >
    {children}
  </th>
);

const FarmsTable: FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <table className="min-w-full">
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
                <FarmsTableHeaderCell>{t("v2.farms.apy")}</FarmsTableHeaderCell>
                <FarmsTableHeaderCell>
                  {t("v2.farms.liquidity")}
                </FarmsTableHeaderCell>
              </tr>
            </thead>
            <tbody className="text-white">
              {farms.map((farm) => (
                <FarmsTableRow key={farm.asset} farm={farm} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FarmsTable;
