import React, { FC } from "react";
import { PickleModelJson } from "picklefinance-core";
import { PickleAsset } from "picklefinance-core/lib/model/PickleModelJson";
import { iOffchainVoteData, JarVote } from "v2/store/offchainVotes";

import { PieChart, Pie, ResponsiveContainer, Tooltip, LabelList, Cell } from "recharts";
import { formatPercentage } from "v2/utils";
import { round } from "lodash";
import CustomTooltip from "./PieChartTooltip";

const Chart: FC<{
  chain: string;
  core?: PickleModelJson.PickleModelJson;
  offchainVoteData?: iOffchainVoteData | undefined;
}> = ({ chain, core, offchainVoteData }) => {
  const isMainnet = chain === "eth";
  const data: JarChartData[] = isMainnet
    ? getMainnetPlatformWeights(core, offchainVoteData)
    : getSidechainPlatformWeights(offchainVoteData, chain);
  if (data.length < 1)
    return (
      <div className="h-full">
        <p className="text-center">Chart Unavailable</p>
      </div>
    );
  return (
    <ResponsiveContainer width={500}>
      <PieChart>
        <Pie
          data={data}
          dataKey="weight"
          nameKey="jar"
          cx="50%"
          cy="50%"
          label={renderCustomizedLabel}
          labelLine={{ stroke: "rgb(var(--color-foreground-alt-100))" }}
          outerRadius={150}
          strokeWidth={data.length >= 1 ? 1 : 10}
          stroke={"rgb(var(--color-foreground-alt-100))"}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colorPicker(data, entry, index)} />
          ))}
          <LabelList dataKey="jar" position="outside" offset={20} formatter={jarStratFormat} />
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
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {formatPercentage(percent * 100, 1)}
    </text>
  );
};

const stringForAsset = (asset: PickleAsset): string => {
  return asset.details?.apiKey ? asset.details.apiKey + " (" + asset.id + ")" : asset.id;
};

const getMainnetPlatformWeights = (
  core: PickleModelJson.PickleModelJson | undefined,
  offchainVoteData: iOffchainVoteData | undefined,
): JarChartData[] => {
  const mainnetJars: PickleModelJson.JarDefinition[] = core
    ? core.assets.jars.filter((j) => j.chain === "eth")
    : [];
  const ethNetwork = offchainVoteData?.chains.filter((c) => c.chain === "eth")[0];
  const ethChainWeight = ethNetwork?.rawChainWeight;
  let chartData = [];
  for (let i = 0; i < mainnetJars.length; i++) {
    if (mainnetJars[i].farm?.details?.allocShare !== undefined) {
      const jar = mainnetJars[i].details.apiKey; //stringForAsset(mainnetJars[i]);
      const chainWeight = mainnetJars[i].farm?.details?.allocShare
        ? mainnetJars[i].farm?.details?.allocShare || 0
        : 0;
      const platformWeight = ethChainWeight ? chainWeight * ethChainWeight : 0;
      chartData.push({
        jar: jar,
        weight: chainWeight,
        platformWeight: platformWeight,
      });
    }
  }
  const other = chartData.filter((v) => v.weight < 0.03);
  const sumOther = other.reduce((x, y) => x + y.weight, 0);
  chartData = sortByWeight(chartData)
    .filter((v) => v.weight >= 0.03)
    .slice(-10);
  chartData.push({ jar: "Other", weight: sumOther });
  return chartData;
};

const getSidechainPlatformWeights = (
  offchainVoteData: iOffchainVoteData | undefined,
  chain: string,
): JarChartData[] => {
  const platformWeights = offchainVoteData ? offchainVoteData.chains || [] : [];
  let chartData = [];
  for (let c = 0; c < platformWeights.length; c++) {
    if (platformWeights[c].chain === chain) {
      let jarVotes: JarVote[] = platformWeights[c].jarVotes;
      for (let j = 0; j < jarVotes.length; j++) {
        chartData.push({
          jar: jarVotes[j].key,
          weight: jarVotes[j].jarVoteAsChainEmissionShare || 0,
          platformWeight: jarVotes[j].jarVoteAsEmissionShare || 0,
        });
      }
    }
  }
  const other = chartData.filter((v) => round(v.weight, 2) <= 0.03);
  const sumOther = other.reduce((x, y) => x + y.weight, 0);
  chartData = sortByWeight(chartData)
    .filter((v) => round(v.weight, 2) > 0.03)
    .slice(-15);
  chartData.push({ jar: "Other", weight: sumOther });
  return chartData;
};

const colorPicker = (d: JarChartData[], e: JarChartData, n: number) => {
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

const sortByWeight = (data: JarChartData[]) =>
  data ? data.sort((a, b) => (a.weight > b.weight ? 1 : -1)) : [];

interface JarChartData {
  jar: string;
  weight: number;
  platformWeight?: number;
}

interface iLabel {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const jarStratFormat = (i: string) => {
  const strats = [
    {
      label: "Delegate to the Pickle Team",
      value: "strategy.delegate.team",
    },
    {
      label: "Vote By TVL",
      value: "strategy.tvl",
    },
    {
      label: "Vote By Profit",
      value: "strategy.profit",
    },
  ];

  let label = i;
  for (let n = 0; n < strats.length; n++)
    if (strats[n].value === i) {
      label = strats[n].label;
    }

  return label;
};

export default Chart;
