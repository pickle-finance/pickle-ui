import { FC } from "react";
import { ChainNetwork, PickleModelJson } from "picklefinance-core";
import { Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatDollars } from "v2/utils";
import CustomTooltip from "./PieChartTooltip";

const TopJarsPieChart: FC<{ core: PickleModelJson.PickleModelJson; chain?: ChainNetwork }> = ({
  core,
  chain,
}) => {
  const jarData: iJarTvl[] = [];
  for (let n = 0; n < core.assets.jars.length; n++) {
    let jar = core.assets.jars[n];
    if (chain && jar.chain !== chain) continue;
    if (jar.details && jar.details.harvestStats && jar.details.harvestStats.balanceUSD)
      jarData.push({
        name: jar.farm?.farmNickname ? jar.farm?.farmNickname : undefined,
        apiKey: jar.details.apiKey,
        id: jar.id,
        tvl: jar.details.harvestStats.balanceUSD,
        apr: jar.aprStats ? jar.aprStats.apr : undefined,
        apy: jar.aprStats ? jar.aprStats.apy : undefined,
      });
  }
  const sortedJarData = jarData.sort((a, b) => (a.tvl > b.tvl ? -1 : 1));
  const chartData = sortedJarData.slice(0, 5);

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="tvl"
          nameKey="id"
          cx="50%"
          cy="50%"
          label={renderCustomizedLabel}
          labelLine={{ stroke: "rgb(var(--color-background-light))" }}
          outerRadius={150}
          innerRadius={100}
          strokeWidth={chartData.length >= 1 ? 1 : 10}
          stroke={"rgb(var(--color-foreground-alt-100))"}
          isAnimationActive={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colorPicker(chartData, entry, index)} />
          ))}
          <LabelList dataKey="jar" position="outside" offset={20} />
        </Pie>
        <Tooltip
          content={({ active, payload }) => <CustomTooltip active={active} payload={payload} />}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, tvl }: iLabel) => {
  const radius = outerRadius * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="bottom">
      {formatDollars(tvl)}
    </text>
  );
};

const colorPicker = (d: any[], e: any, n: number) => {
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

interface iLabel {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  tvl: number;
  name: string;
}

export interface iJarTvl {
  name: string | undefined;
  apiKey: string;
  id: string;
  tvl: number;
  apr?: number;
  apy?: number;
}

export default TopJarsPieChart;
