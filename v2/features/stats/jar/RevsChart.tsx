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
  Legend,
} from "recharts";
import { formatDollars } from "v2/utils/format";
import { DailyRevExp, JarChartData } from "v2/types";

const Chart: FC<{ data: JarChartData }> = ({ data }) => {
  const { t } = useTranslation("common");
  const assetData =
    data && data.revenueExpenses && data.revenueExpenses.daily ? data.revenueExpenses.daily : [];
  const sortedData: DailyRevExp[] = sortByDate(assetData);
  const chartData: DailyRevExp[] = computeMovingAverage(sortedData, 10);
  const dataMax = getDataMax(chartData);

  if (chartData.length > 0)
    return (
      <ResponsiveContainer className="w-full">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="0" stroke="rgb(var(--color-foreground-alt-400))" />
          <XAxis
            dataKey="timeStart"
            tickFormatter={(timeStart) => new Date(timeStart * 1000).toLocaleDateString()}
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
            domain={[0, dataMax]}
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
            contentStyle={{
              backgroundColor: "rgb(var(--color-foreground-alt-500))",
              borderColor: "rgb(var(--color-foreground-alt-500))",
              borderRadius: 10,
            }}
            labelFormatter={(label) =>
              new Date(label * 1000).toLocaleDateString() +
              " " +
              new Date(label * 1000).toLocaleTimeString()
            }
            formatter={(value: number, label: string) => [
              formatDollars(value),
              t(`v2.stats.tooltips.${label}`),
            ]}
          />
          <Bar dataKey="revsUsd" fill="rgb(var(--color-primary-light))" />
          <Line dataKey="ma" dot={false} stroke="rgb(var(--color-accent))" />
          <Legend
            formatter={(label: string) => (
              <span className="text-foreground-200">{t(`v2.stats.tooltips.${label}`)}</span>
            )}
            iconType="wye"
            wrapperStyle={{ paddingTop: 25 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  return <></>;
};

const computeMovingAverage = (sortedData: DailyRevExp[], period: number): DailyRevExp[] => {
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

const sortByDate = (assetData: DailyRevExp[]) =>
  assetData ? assetData.sort((a, b) => (a.timeStart > b.timeStart ? 1 : -1)) : [];

const getRevAverage = (data: DailyRevExp[]) =>
  data.reduce((acc, val) => acc + val.revsUsd, 0) / data.length;

const getDataMax = (o: any[]): number => {
  let dataMax = 0;
  for (let i = 0; i < o.length; i++) if (o[i].value > dataMax) dataMax = o[i].value;
  return dataMax;
};

export default Chart;
