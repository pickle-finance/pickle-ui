import React, { FC } from "react";
import { PickleModelJson } from "picklefinance-core";
import { PickleAsset } from "picklefinance-core/lib/model/PickleModelJson";
import { iOffchainVoteData, JarVote } from "v2/store/offchainVotes";

import { PieChart, Pie, ResponsiveContainer, Tooltip, LabelList, Cell } from "recharts";
import { formatPercentage } from "v2/utils";
import { round } from "lodash";
import { useTranslation } from "next-i18next";

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
        <p className="text-center">Vote Data Unavailable</p>
      </div>
    );
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey="weight"
          nameKey="jar"
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
          <LabelList dataKey="jar" position="outside" offset={20} formatter={jarStratFormat} />
        </Pie>
        <Tooltip
          content={({ active, payload }) => <CustomTooltip active={active} payload={payload} />}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const CustomTooltip: FC<{ active: any; payload: any }> = ({ active, payload }) => {
  const { t } = useTranslation("common");

  if (active && payload && payload.length) {
    const label = payload[0].payload.jar;
    const weight = payload[0].value;
    const platformWeight = payload[0].payload.platformWeight;

    return (
      <div className="bg-background-light p-5 rounded border border-foreground-alt-300">
        <table>
          {label && <TooltipRow label={t("v2.dill.vote.charts.tooltips.asset")} value={label} />}
          {weight && (
            <TooltipRow
              label={t("v2.dill.vote.charts.tooltips.chainWeight")}
              value={formatPercentage(weight, 3)}
            />
          )}
          {platformWeight && (
            <TooltipRow
              label={t("v2.dill.vote.charts.tooltips.platformWeight")}
              value={formatPercentage(platformWeight, 5)}
            />
          )}
        </table>
      </div>
    );
  }

  return null;
};

const TooltipRow: FC<{ label: string; value: string }> = ({ label, value }) => (
  <tr className="grid grid-cols-2 gap-5">
    <td>
      <p className="text-foreground-alt-200 col-span-1">{label}</p>
    </td>
    <td>
      <p className="text-foreground-alt-200 col-span-2">{value}</p>
    </td>
  </tr>
);

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
      const jar = stringForAsset(mainnetJars[i]);
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
  // console.log(platformWeights);
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
