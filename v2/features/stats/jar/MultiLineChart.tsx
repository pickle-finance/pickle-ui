import { useTranslation } from "next-i18next";
import React, { FC } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  ResponsiveContainer,
} from "recharts";
import { AssetCoreData, JarChartData } from "./types";

const aprAndApyData = (sortedAssetData: AssetCoreData) => {
  return {
    timestamp: sortedAssetData.timestamp,
    jarApr: sortedAssetData.jarApr,
    minApy: sortedAssetData.jarApr + sortedAssetData.farmMinApy,
    maxApy: sortedAssetData.jarApr + sortedAssetData.farmMaxApy,
  };
};

const Chart: FC<{ data: JarChartData; timeUnit: string }> = ({
  data,
  timeUnit,
}) => {
  const { t } = useTranslation("common");
  
  const assetData = data && data.assetData ? data.assetData[timeUnit] : [];
  const sortedData = assetData
    ? assetData.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
    : [];
  const chartData = sortedData.map(aprAndApyData);
  return (
    <ResponsiveContainer className="w-full">
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
          tickFormatter={(value) => {
            return new Intl.NumberFormat("en", {
              notation: "compact",
              compactDisplay: "short",
            }).format(value) + "%"
          }}
          width={100}
          padding={{ top: 50 }}
          tick={{ fill: "rgb(var(--color-foreground-alt-300))" }}
          tickCount={9}
        >
          <Label
            value={t("v2.stats.jar.pctYield") as string}
            position="insideLeft"
            angle={-90}
            fill="rgb(var(--color-foreground-alt-100))"
            style={{ textAnchor: "middle" }}
          />
        </YAxis>
        <Legend wrapperStyle={{ paddingTop: 25 }} />
        <Tooltip
          cursor={false}
          contentStyle={{ backgroundColor: "black", color: "#26ff91" }}
          labelFormatter={(label) =>
            new Date(label).toLocaleDateString() +
            " " +
            new Date(label).toLocaleTimeString()
          }
          formatter={(value: number) => value.toFixed(3) + "%"}
        />
        <Line
          type="monotone"
          dataKey="jarApr"
          stroke="rgb(var(--color-primary-dark))"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="minApy"
          stroke="rgb(var(--color-primary))"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="maxApy"
          stroke="rgb(var(--color-primary-light))"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;
