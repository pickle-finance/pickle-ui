import { FC } from "react";

import TopNavbar from "./TopNavbar";
import PerformanceCard from "./PerformanceCard";
import PickleBalanceCard from "./PickleBalanceCard";
import DillBalanceCard from "./DillBalanceCard";

const Dashboard: FC = () => (
  <main className="sm:pl-64">
    <div className="px-4 py-2 sm:px-10 sm:py-10 text-white">
      <TopNavbar />
      <div className="block lg:flex">
        <div className="w-full mb-4 lg:w-1/2 lg:mr-8 lg:mb-0">
          <PerformanceCard />
        </div>
        <div className="flex flex-col justify-between">
          <PickleBalanceCard />
          <DillBalanceCard />
        </div>
      </div>
    </div>
  </main>
);

export default Dashboard;
