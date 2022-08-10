import { FC } from "react";
import { useTranslation } from "next-i18next";

import type { PickleFinancePage } from "v2/types";
import PerformanceCard from "v2/components/PerformanceCard";
import PickleDillBalanceCard from "v2/components/PickleDillBalanceCard";
import FarmsTable from "v2/features/farms/FarmsTable";
import DashboardCalloutCard from "v2/components/DashboardCalloutCard";

const Dashboard: PickleFinancePage = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <div className="block xl:flex mb-8 sm:mb-10">
        <div className="w-full mb-4 xl:w-1/2 xl:mr-8 xl:mb-0">
          <PerformanceCard />
        </div>
        <div className="flex flex-col md:justify-start 2xl:justify-between">
          <PickleDillBalanceCard />
        </div>
      </div>
      <FarmsTable title={t("v2.dashboard.joinedFarms")} dashboard requiresUserModel />
      <div className="mt-4">
        <DashboardCalloutCard />
      </div>
    </>
  );
};

const PageTitle: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="font-title font-medium text-2xl sm:text-3xl pt-2">
        {t("v2.dashboard.pickleTitle")}
      </h1>
      <h2 className="font-body font-normal text-foreground-alt-200 text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.dashboard.pickleSubtitle")}
      </h2>
    </>
  );
};

Dashboard.PageTitle = PageTitle;

export { getStaticProps } from "v1/util/locales";

export default Dashboard;
