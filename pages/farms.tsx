import { FC } from "react";
import { useTranslation } from "next-i18next";

import type { PickleFinancePage } from "v2/types";
import FarmsTable from "v2/features/farms/FarmsTable";

const Farms: PickleFinancePage = () => {
  return <FarmsTable />;
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">{t("v2.nav.jarsAndFarms")}</h1>
  );
};

Farms.PageTitle = PageTitle;

export { getStaticProps } from "v1/util/locales";

export default Farms;
