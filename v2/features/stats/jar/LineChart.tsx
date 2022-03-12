import { useTranslation } from "next-i18next";
import React, { FC } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  ResponsiveContainer,
} from "recharts";
import { JarChartData, AssetCoreData } from "./types";

const pTokenPct = (data: AssetCoreData) => ({
  timestamp: data.timestamp,
  ptokensInFarm: data.ptokensInFarm / data.supply,
});

const Chart: FC<{ chartKey: string; data: JarChartData; timeUnit: string }> = ({
  chartKey,
  data,
  timeUnit,
}) => {
  const { t } = useTranslation("common");

  const assetData = data && data.assetData ? data.assetData[timeUnit] : [];
  const sortedData = assetData
    ? assetData.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
    : [];
  let chartData: any = sortedData.filter(
    (x) => x[chartKey as keyof AssetCoreData],
  );
  if (chartKey === "ptokensInFarm") {
    chartData = chartData.map(pTokenPct);
  }

  return (
    <ResponsiveContainer>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="0" stroke="rgb(var(--color-foreground-alt-400))"/>
        <XAxis
          dataKey="timestamp"
          tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
          height={75}
          angle={300}
          tickMargin={35}
          tick={{ fill: "rgb(var(--color-foreground-alt-300))", dx: -20 }}
        />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("en", {
              notation: "compact",
              compactDisplay: "short",
            }).format(value)
          }
          width={100}
          padding={{ top: 50 }}
          tick={{ fill: "rgb(var(--color-foreground-alt-300))", dx: -10 }}
          tickCount={9}
        >
          <Label
            value={t(`v2.stats.jar.${chartKey}YLabel`) as string}
            position="insideLeft"
            angle={-90}
            fill="rgb(var(--color-foreground-alt-100))"
            style={{ textAnchor: "middle" }}
          />
        </YAxis>
        <Tooltip
          cursor={false}
          contentStyle={{ backgroundColor: "black", color: "#26ff91" }}
          labelFormatter={(label) =>
            new Date(label).toLocaleDateString() +
            " " +
            new Date(label).toLocaleTimeString()
          }
          formatter={(value: number) =>
            new Intl.NumberFormat("en", {}).format(value) +
            " " +
            t(`v2.stats.jar.${chartKey}TooltipUnits`)
          }
        />
        <Line type="monotone" dataKey={chartKey} stroke="rgb(var(--color-accent-light))" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;
