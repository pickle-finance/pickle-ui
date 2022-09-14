import React, { FC, useState } from "react";
import ChartSelect from "./ChartSelect";
import LineChart from "./LineChart";
import BiaxialChart from "./BiaxialChart";
import YieldChart from "./MultiLineChart";
import RevsChart from "./RevsChart";
import TimeUnitPanel from "./TimeUnitPanel";
import { JarChartData } from "v2/types";

const ChartContainer: FC<{ jarData: JarChartData }> = ({ jarData }) => {
  const [selectedChart, setSelectedChart] = useState("value");
  const chartChange = (e: HTMLSelectElement): void => setSelectedChart(e.value);

  const [selectedTimeUnit, setSelectedTimeUnit] = useState("hr");
  const timeChange = (f: string): void => {
    setSelectedTimeUnit(f);
  };

  const lineChartOptions = [
    "value",
    "balance",
    "depositTokenPrice",
    "farmAllocShare",
    "farmPicklePerDay",
    "harvestable",
    "ptokensInFarm",
    "ratio",
  ];

  return (
    <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8 mb-5">
      <h2 className="font-body font-bold text-xl text-foreground-alt-200">
        {jarData && jarData.apiKey && jarData.apiKey.toUpperCase()}
      </h2>
      <span>
        <TimeUnitPanel timeChange={timeChange} />
        <ChartSelect chartChange={chartChange} />
      </span>
      <aside className="h-[600px] px-3 py-10">
        {lineChartOptions.includes(selectedChart) && (
          <LineChart chartKey={selectedChart} data={jarData} timeUnit={selectedTimeUnit} />
        )}
        {selectedChart === "tokenPriceVNum" && (
          <BiaxialChart data={jarData} timeUnit={selectedTimeUnit} />
        )}
        {selectedChart === "yield" && <YieldChart data={jarData} timeUnit={selectedTimeUnit} />}
        {selectedChart === "revs" && <RevsChart data={jarData} />}
      </aside>
    </div>
  );
};

export default ChartContainer;
