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
import { formatDollars } from "v2/utils/format";
import { TvlData } from "v2/types";

const Chart: FC<{ data: TvlData[] | undefined }> = ({ data }) => {
  const { t } = useTranslation("common");
  const chartData = data
    ? data.filter(filterZero).sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
    : undefined;
  const dataMax: number | undefined = chartData ? getDataMax(chartData) : undefined;

  if (chartData && dataMax)
    return (
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="0" stroke="rgb(var(--color-foreground-alt-400))" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
            height={75}
            angle={300}
            tickMargin={25}
            tick={{ fill: "rgb(var(--color-foreground-alt-300))", dx: -18, fontSize: 12 }}
          />
          <YAxis
            domain={[0, dataMax]}
            tickFormatter={(value) =>
              new Intl.NumberFormat("en", { notation: "compact", compactDisplay: "short" }).format(
                value,
              )
            }
            width={100}
            padding={{ top: 25 }}
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
              new Date(label).toLocaleDateString() + " " + new Date(label).toLocaleTimeString()
            }
            formatter={(value: number) => [formatDollars(value), t("v2.stats.tooltips.value")]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="rgb(var(--color-accent-light))"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  return <></>;
};

const filterZero = (data: TvlData): TvlData | void => {
  if (data.value !== 0) return data;
};

const getDataMax = (o: any[]): number => {
  let dataMax = 0;
  for (let i = 0; i < o.length; i++) if (o[i].value > dataMax) dataMax = o[i].value;
  return dataMax;
};

export default Chart;
