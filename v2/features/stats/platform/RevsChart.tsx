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
  Legend,
} from "recharts";
import { formatDollars } from "v2/utils/";
import { RevenueData } from "v2/types";
import { useTranslation } from "next-i18next";

const sortByDate = (data: RevenueData[]) =>
  data ? data.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1)) : [];
const getRevAverage = (data: RevenueData[]) =>
  data.reduce((acc, val) => acc + val.revsUsd, 0) / data.length;

const computeMovingAverage = (sortedData: RevenueData[], period: number): RevenueData[] => {
  if (period > sortedData.length) {
    for (let i = 0; i < sortedData.length; i++) {
      sortedData[i].ma = getRevAverage(sortedData);
    }
  } else {
    for (let i = 10; i < sortedData.length; i++) {
      sortedData[i].ma = getRevAverage(sortedData.slice(i - period, i));
    }
  }
  return sortedData;
};
const Chart: FC<{ data: RevenueData[] }> = ({ data }) => {
  const { t } = useTranslation("common");
  const sortedData: RevenueData[] = sortByDate(data);
  const chartData = computeMovingAverage(sortedData, 10);

  return (
    <ResponsiveContainer className="w-full">
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="0" stroke="rgb(var(--color-foreground-alt-400))" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleDateString()}
          height={75}
          angle={300}
          tickMargin={35}
          tick={{ fill: "rgb(var(--color-foreground-alt-300))", dx: -20 }}
        />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("en", { notation: "compact", compactDisplay: "short" }).format(
              value,
            )
          }
          width={100}
          padding={{ top: 50 }}
          tick={{ fill: "rgb(var(--color-foreground-alt-300))", dx: -10 }}
          tickCount={9}
        >
          <Label
            value={t("v2.dill.usdValue") as string}
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
        <Line dataKey="ma" dot={false} stroke="rgb(var(--color-accent))" />
        <Legend wrapperStyle={{ paddingTop: 25 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default Chart;
