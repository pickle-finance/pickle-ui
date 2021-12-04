import { FC } from "react";
import { useTranslation } from "next-i18next";

import type { PickleFinancePage } from "v2/types";
import JoinedFarms from "v2/components/JoinedFarms";

const Farms: PickleFinancePage = () => (
  <div className="block mb-8 sm:mb-10">
    <JoinedFarms />
  </div>
);
const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">
      {t("v2.nav.jarsAndFarms")}
    </h1>
  );
};

Farms.PageTitle = PageTitle;

export { getStaticProps } from "../../util/locales";

export default Farms;
