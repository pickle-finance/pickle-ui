import { FC } from "react";

import TopNavbar from "./TopNavbar";
import PerformanceCard from "./PerformanceCard";

const Dashboard: FC = () => (
  <main className="sm:pl-64">
    <div className="px-4 py-2 sm:px-10 sm:py-10 text-white">
      <TopNavbar />
      <div className="w-full sm:w-1/2">
        <PerformanceCard />
      </div>
    </div>
  </main>
);

export default Dashboard;
