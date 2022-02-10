import { FC } from "react";
import { useTranslation } from "next-i18next";

import type { PickleFinancePage } from "v2/types";

const Stats: PickleFinancePage = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <div className="block lg:flex mb-8 sm:mb-10">
        <div className="w-full mb-4 lg:w-1/2 lg:mr-8 lg:mb-0">

        </div>
      </div>
    </>
  )
}

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">
      {t("v2.nav.jarsAndFarms")}
    </h1>
  );
};

Stats.PageTitle = Stats;

export { getStaticProps } from "../../util/locales";

export default Stats;