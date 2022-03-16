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
import { JarChartData, AssetCoreData } from "v2/types";

const Chart: FC<{ chartKey: string; data: JarChartData; timeUnit: string }> = ({
  chartKey,
  data,
  timeUnit,
}) => {
  const { t } = useTranslation("common");

  const assetData = data && data.assetData ? data.assetData[timeUnit] : [];
  let chartData: AssetCoreData[] | any[] = assetData
    ? assetData.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
    : [];
  if (chartKey === "ptokensInFarm") {
    chartData = chartData.map(pTokenPct);
  }
  const dataMax = getDataMax(chartData, chartKey);
  const dataMin = getDataMin(chartData, chartKey);

  return (
    <ResponsiveContainer>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="0" stroke="rgb(var(--color-foreground-alt-400))" />
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
          domain={[dataMin - dataMin * 0.05, dataMax]}
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
            new Date(label).toLocaleDateString() + " " + new Date(label).toLocaleTimeString()
          }
          formatter={(value: number) =>
            new Intl.NumberFormat("en", {}).format(value) +
            " " +
            t(`v2.stats.jar.${chartKey}TooltipUnits`)
          }
        />
        <Line
          type="monotone"
          dataKey={chartKey}
          stroke="rgb(var(--color-accent-light))"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const pTokenPct = (data: AssetCoreData) => ({
  timestamp: data.timestamp,
  ptokensInFarm: data.ptokensInFarm / data.supply,
});

const getDataMax = (o: any[], key: string): number => {
  let dataMax = 0;
  for (let i = 0; i < o.length; i++) if (o[i][key] > dataMax) dataMax = o[i][key];
  return dataMax;
};

const getDataMin = (o: any[], key: string): number => {
  let dataMin = getDataMax(o, key);
  for (let i = 0; i < o.length; i++) if (o[i][key] < dataMin) dataMin = o[i][key];
  return dataMin;
};

export default Chart;
