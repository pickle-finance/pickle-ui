import { useTranslation } from "next-i18next";
import React, { FC } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  ResponsiveContainer,
} from "recharts";
import { formatDollars } from "v2/utils/format";
import { JarChartData } from "./types";

const Chart: FC<{ data: JarChartData }> = ({ data }) => {
  const { t } = useTranslation("common");

  const assetData =
    data && data.revenueExpenses && data.revenueExpenses.daily
      ? data.revenueExpenses.daily
      : [];
  const chartData = assetData
    ? assetData.sort((a, b) => (a.timeStart > b.timeStart ? 1 : -1))
    : [];

  return (
    <ResponsiveContainer className="w-full">
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="0" stroke="rgb(var(--color-foreground-alt-400))"/>
        <XAxis
          dataKey="timeStart"
          tickFormatter={(timeStart) =>
            new Date(timeStart * 1000).toLocaleDateString()
          }
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
            value={t(`v2.stats.jar.revenueYLabel`) as string}
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
            new Date(label * 1000).toLocaleDateString() +
            " " +
            new Date(label * 1000).toLocaleTimeString()
          }
          formatter={(value: number) => formatDollars(value)}
        />
        <Bar dataKey="revsUsd" fill="rgb(var(--color-primary-light))" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default Chart;
