import React, { FC, useEffect, useState } from "react";
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

const Chart: FC<{ data: RevenueData[] }> = ({ data }) => {
  const { t } = useTranslation("common");
  const [chartData, setChartData] = useState<RevenueData[]>([]);
  const [dataMax, setDataMax] = useState<number>(0);

  useEffect(() => {
    if (data && data.length > 0) {
      const sortedData: RevenueData[] = sortByDate(data);
      setChartData(computeMovingAverage(sortedData, 10));
    }
  }, [data]);

  useEffect(() => {
    if (chartData.length > 0) setDataMax(getDataMax(chartData));
  }, [chartData]);

  if (chartData.length > 0)
    return (
      <ResponsiveContainer>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="0" stroke="rgb(var(--color-foreground-alt-400))" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleDateString()}
            height={75}
            angle={300}
            tickMargin={25}
            tick={{ fill: "rgb(var(--color-foreground-alt-300))", dx: -18, fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat("en", { notation: "compact", compactDisplay: "short" }).format(
                value,
              )
            }
            domain={dataMax ? [0, dataMax] : undefined}
            width={100}
            tick={{ fill: "rgb(var(--color-foreground-alt-300))", dx: -10, fontSize: 12 }}
            tickCount={9}
          >
            <Label
              value={t("v2.dill.usdValue") as string}
              position="insideLeft"
              angle={-90}
              offset={20}
              fill="rgb(var(--color-foreground-alt-100))"
              style={{ textAnchor: "middle", fontSize: 12 }}
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
          <Bar dataKey="revsUsd" isAnimationActive={false} fill="rgb(var(--color-primary-light))" />
          <Line
            dataKey="ma"
            dot={false}
            isAnimationActive={false}
            stroke="rgb(var(--color-accent))"
          />
          <Legend
            formatter={(label: string) => (
              <span className="text-foreground-alt-200 text-xs">
                {t(`v2.stats.tooltips.${label}`)}
              </span>
            )}
            iconType="wye"
            wrapperStyle={{
              lineHeight: "25px",
            }}
            // wrapperStyle={{ paddingTop: 25 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  return <></>;
};

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

const sortByDate = (data: RevenueData[]) =>
  data ? data.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1)) : [];

const getRevAverage = (data: RevenueData[]) =>
  data.reduce((acc, val) => acc + val.revsUsd, 0) / data.length;

const getDataMax = (o: any[]): number => {
  let dataMax = 0;
  for (let i = 0; i < o.length; i++) if (o[i].value > dataMax) dataMax = o[i].value;
  return dataMax;
};

export default Chart;
