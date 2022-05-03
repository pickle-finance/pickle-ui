import { FC } from "react";
import { useTranslation } from "next-i18next";

import type { PickleFinancePage } from "v2/types";
import BrineryTable from "v2/features/brinery/BrineryTable";

const Brineries: PickleFinancePage = () => {
  const { t } = useTranslation("common");

  return <BrineryTable />;
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">{t("v2.nav.brinery")}</h1>
  );
};

Brineries.PageTitle = PageTitle;

export { getStaticProps } from "../../util/locales";

export default Brineries;
