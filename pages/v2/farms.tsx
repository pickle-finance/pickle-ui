import { FC } from "react";
import { useTranslation } from "next-i18next";

import type { PickleFinancePage } from "v2/types";

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">
      {t("v2.nav.jarsAndFarms")}
    </h1>
  );
};

const Farms: PickleFinancePage = () => <></>;

Farms.PageTitle = PageTitle;

export { getStaticProps } from "../../util/locales";

export default Farms;
