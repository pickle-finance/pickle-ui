import { FC } from "react";

import PerformanceCard from "./PerformanceCard";
import PickleBalanceCard from "./PickleBalanceCard";
import DillBalanceCard from "./DillBalanceCard";
import JoinedFarms from "./JoinedFarms";
import DashboardCalloutCard from "./DashboardCalloutCard";

const Dashboard: FC = () => (
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
    <JoinedFarms />
    <div className="mt-4">
      <DashboardCalloutCard />
    </div>
  </>
);

export default Dashboard;
