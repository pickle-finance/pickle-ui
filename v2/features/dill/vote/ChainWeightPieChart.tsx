import React, { FC } from "react";
import { iOffchainVoteData } from "v2/store/offchainVotes";
import { PieChart, Pie, ResponsiveContainer, Tooltip, LabelList, Cell } from "recharts";
import { formatPercentage } from "v2/utils";

const Chart: FC<{
  offchainVoteData?: iOffchainVoteData | undefined;
}> = ({ offchainVoteData }) => {
  const data: PieChartData[] = getSidechainPlatformWeights(offchainVoteData);

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
          <LabelList dataKey="chain" position="outside" offset={20} formatter={chainStratFormat} />
        </Pie>
        <Tooltip
          labelFormatter={(label: any) => chainStratFormat(label.chain)}
          formatter={(value: number) => formatPercentage(value)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: iLabel) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {formatPercentage(percent)}
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
): PieChartData[] => {
  const platformWeights = offchainVoteData ? offchainVoteData.chains || [] : [];
  console.log(platformWeights);
  let chartData = [];
  for (let c = 0; c < platformWeights.length; c++) {
    chartData.push({
      chain: platformWeights[c].chain,
      weight: platformWeights[c].adjustedChainWeight,
    });
  }
  const other = chartData.filter((v) => v.weight < 0.05);
  const sumOther = other.reduce((x, y) => x + y.weight, 0);
  chartData = sortByWeight(chartData)
    .filter((v) => v.weight > 0.05)
    .slice(-15);
  chartData.push({ chain: "Other", weight: sumOther });
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
  jar?: string;
  weight: number;
}

const chainStratFormat = (label: string) => {
  return label.toLocaleUpperCase();
};

export default Chart;
