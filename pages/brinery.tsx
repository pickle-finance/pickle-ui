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
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">{t("v2.nav.brinery")}</h1>
      <h2 className="font-body font-normal text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.brinery.subtitle")}
      </h2>
    </>
  );
};

Brineries.PageTitle = PageTitle;

export { getStaticProps } from "v1/util/locales";

export default Brineries;
