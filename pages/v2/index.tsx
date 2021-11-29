import { FC } from "react";
import { useTranslation } from "next-i18next";

import type { PickleFinancePage } from "v2/types";
import Dashboard from "v2/components/Dashboard";

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">
        {t("v2.dashboard.pickleTitle")}
      </h1>
      <h2 className="font-body font-normal text-gray-light text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.dashboard.pickleSubtitle")}
      </h2>
    </>
  );
};

const Root: PickleFinancePage = () => <Dashboard />;

Root.PageTitle = PageTitle;

export { getStaticProps } from "../../util/locales";

export default Root;
