import { FC } from "react";
import { useTranslation } from "next-i18next";

import type { PickleFinancePage } from "v2/types";
import PerformanceCard from "v2/components/PerformanceCard";
import PickleBalanceCard from "v2/components/PickleBalanceCard";
import DillBalanceCard from "v2/components/DillBalanceCard";
import FarmsTable from "v2/features/farms/FarmsTable";
import DashboardCalloutCard from "v2/components/DashboardCalloutCard";

const Dashboard: PickleFinancePage = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <div className="block lg:flex mb-8 sm:mb-10">
        <div className="w-full mb-4 lg:w-1/2 lg:mr-8 lg:mb-0">
          <PerformanceCard />
        </div>
        <div className="flex flex-col justify-between">
          <PickleBalanceCard />
          <DillBalanceCard />
        </div>
      </div>
      <FarmsTable title={t("v2.dashboard.joinedFarms")} simple />
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
      <h2 className="font-body font-normal text-gray-light text-sm sm:text-base leading-4 sm:leading-6 mt-1">
        {t("v2.dashboard.pickleSubtitle")}
      </h2>
    </>
  );
};

Dashboard.PageTitle = PageTitle;

export { getStaticProps } from "../../util/locales";

export default Dashboard;
