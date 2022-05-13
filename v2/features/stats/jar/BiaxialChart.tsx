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
import { AssetCoreData, JarChartData } from "v2/types";

const Chart: FC<{ data: JarChartData; timeUnit: string }> = ({ data, timeUnit }) => {
  const { t } = useTranslation("common");

  const assetData: AssetCoreData[] = formatDates(data, timeUnit).filter(
    (a) => a.supply !== 0 && a.depositTokenPrice !== 0,
  );
  const chartData = assetData.map((x) => ({
    timestamp: x.timestamp,
    supply: x.supply,
    tokenPrice: x.depositTokenPrice,
  }));
  if (chartData.length > 0)
    return (
      <ResponsiveContainer className="w-full">
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
            yAxisId="left"
            tickFormatter={(value) => {
              return new Intl.NumberFormat("en", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value);
            }}
            width={100}
            padding={{ top: 50 }}
            tick={{ fill: "rgb(var(--color-foreground-alt-300))", dx: -20 }}
            tickCount={9}
          >
            <Label
              value={t(`v2.stats.jar.tokenPriceVNumYLabelLeft`) as string}
              position="insideLeft"
              angle={-90}
              fill="rgb(var(--color-foreground-alt-100))"
              style={{ textAnchor: "middle" }}
            />
          </YAxis>
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => {
              return new Intl.NumberFormat("en", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value);
            }}
            width={100}
            padding={{ top: 50 }}
            tick={{ fill: "rgb(var(--color-foreground-alt-300))", dx: 20 }}
            tickCount={9}
          >
            <Label
              value={t(`v2.stats.jar.tokenPriceVNumYLabelRight`) as string}
              position="insideRight"
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
              new Date(label).toLocaleDateString() + " " + new Date(label).toLocaleTimeString()
            }
            formatter={(value: number, label: string) => [
              formatBigNumber(value),
              t("v2.stats.tooltips.".concat(label)),
            ]}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey={"supply"}
            stroke="rgb(var(--color-accent-light))"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={"tokenPrice"}
            stroke="rgb(var(--color-accent))"
            dot={false}
          />
          <Legend
            formatter={(label: string) => (
              <span className="text-foreground-alt-200">
                {t("v2.stats.tooltips.".concat(label))}
              </span>
            )}
            iconType="plainline"
            wrapperStyle={{ paddingTop: 25 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  return <></>;
};

const formatDates = (jarData: JarChartData, timeUnit: string) => {
  const assetData = jarData && jarData.assetData ? jarData.assetData[timeUnit] : [];
  const sortedData = assetData
    ? assetData.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
    : [];
  return sortedData;
};

const formatBigNumber = (value: number): string => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default Chart;
