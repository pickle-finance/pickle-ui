import React, { FC } from "react";
import { iOffchainVoteData } from "v2/store/offchainVotes";
import { PieChart, Pie, ResponsiveContainer, Tooltip, LabelList, Cell } from "recharts";
import { formatPercentage } from "v2/utils";
import CustomTooltip from "./PieChartTooltip";
import { PickleModelJson } from "picklefinance-core";
import { RawChain } from "picklefinance-core/lib/chain/Chains";

const Chart: FC<{
  offchainVoteData?: iOffchainVoteData | undefined;
  core: PickleModelJson.PickleModelJson | undefined;
}> = ({ offchainVoteData, core }) => {
  const data: PieChartData[] = getSidechainPlatformWeights(offchainVoteData, core);

  if (data.length < 1)
    return (
      <div className="h-full">
        <p className="text-center">Vote Data Unavailable</p>
      </div>
    );
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey="weight"
          nameKey="chain"
          cx="50%"
          cy="50%"
          label={renderCustomizedLabel}
          labelLine={{ stroke: "rgb(var(--color-foreground-alt-100))" }}
          outerRadius={140}
          strokeWidth={data.length >= 1 ? 1 : 10}
          stroke={"rgb(var(--color-foreground-alt-100))"}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colorPicker(data, entry, index)} />
          ))}
          <LabelList
            dataKey="chain"
            position="outside"
            offset={20}
            formatter={(label: string) => chainStratFormat(label, core)}
          />
        </Pie>
        <Tooltip
          content={({ active, payload }) => <CustomTooltip active={active} payload={payload} />}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: iLabel) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {formatPercentage(percent * 100, 2)}
    </text>
  );
};
interface iLabel {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const getSidechainPlatformWeights = (
  offchainVoteData: iOffchainVoteData | undefined,
  core: PickleModelJson.PickleModelJson | undefined,
): PieChartData[] => {
  const platformWeights = offchainVoteData ? offchainVoteData.chains || [] : [];
  let chartData = [];
  for (let c = 0; c < platformWeights.length; c++) {
    let chain: string = platformWeights[c].chain;
    let thisChain: RawChain | undefined = core
      ? core.chains.find((c) => c.network === chain)
      : undefined;
    let chainVisible: string = thisChain ? thisChain.networkVisible : chain;
    let weight: number = platformWeights[c].adjustedChainWeight;

    chartData.push({
      chain: chain,
      chainVisible: chainVisible,
      weight: weight,
    });
  }
  const other = chartData.filter((v) => v.weight < 0.05);
  const sumOther = other.reduce((x, y) => x + y.weight, 0);
  chartData = sortByWeight(chartData)
    .filter((v) => v.weight > 0.05)
    .slice(-15);
  chartData.push({ chain: "Other", chainVisible: "Other", weight: sumOther });
  return chartData;
};

const colorPicker = (d: PieChartData[], e: PieChartData, n: number) => {
  const evenColors = ["rgb(var(--color-primary-light))", "rgb(var(--color-primary))"];
  const oddColors = [
    "rgb(var(--color-primary-light))",
    "rgb(var(--color-primary))",
    "rgb(var(--color-primary-dark))",
  ];
  if (d.length % 2 === 0) return evenColors[n % 2];
  if (d.indexOf(e) === d.length - 1 && n % 3 == 0) return oddColors[1];
  return oddColors[n % 3];
};

const sortByWeight = (data: PieChartData[]) =>
  data ? data.sort((a, b) => (a.weight > b.weight ? 1 : -1)) : [];

interface PieChartData {
  chain?: string;
  chainVisible?: string;
  jar?: string;
  weight: number;
}

const chainStratFormat = (label: string, core: PickleModelJson.PickleModelJson | undefined) => {
  const thisChain = core ? core.chains.find((c) => c.network === label) : undefined;
  const displayName = thisChain ? thisChain.networkVisible : label;
  return displayName;
};

export default Chart;
