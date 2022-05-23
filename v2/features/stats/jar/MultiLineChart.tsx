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
import { ApyChartData, AssetCoreData, JarChartData } from "v2/types";

const Chart: FC<{ data: JarChartData; timeUnit: string }> = ({ data, timeUnit }) => {
  const { t } = useTranslation("common");

  const assetData: AssetCoreData[] = data && data.assetData ? data.assetData[timeUnit] : [];
  const sortedData: AssetCoreData[] = assetData
    ? assetData.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
    : [];
  const chartData: ApyChartData[] = sortedData.map(aprAndApyData).filter((a) => a.jarApr !== 0);
  const dataMax = getDataMax(chartData);
  const dataMin = getDataMin(chartData);

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
            tickFormatter={(value) => {
              return (
                new Intl.NumberFormat("en", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value) + "%"
              );
            }}
            domain={[dataMin - dataMin * 0.1, dataMax]}
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
          <Legend
            formatter={(label: string) => (
              <span className="text-foreground-alt-200">
                {t("v2.stats.tooltips.".concat(label))}
              </span>
            )}
            iconType="plainline"
            wrapperStyle={{ paddingTop: 25 }}
          />
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
            formatter={(value: number, name: string) => [
              value.toFixed(3) + "%",
              t(`v2.stats.tooltips.${name}`),
            ]}
          />
          <Line
            type="monotone"
            dataKey="jarApr"
            stroke="rgb(var(--color-primary-dark))"
            dot={false}
          />
          <Line type="monotone" dataKey="minApy" stroke="rgb(var(--color-primary))" dot={false} />
          <Line
            type="monotone"
            dataKey="maxApy"
            stroke="rgb(var(--color-primary-light))"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  return <></>;
};

const aprAndApyData = (sortedAssetData: AssetCoreData): ApyChartData => {
  return {
    timestamp: sortedAssetData.timestamp,
    jarApr: sortedAssetData.jarApr,
    minApy: sortedAssetData.jarApr + sortedAssetData.farmMinApy,
    maxApy: sortedAssetData.jarApr + sortedAssetData.farmMaxApy,
  };
};

const getDataMax = (o: ApyChartData[]): number => {
  let dataMax = 0;
  for (let i = 0; i < o.length; i++) if (o[i].maxApy > dataMax) dataMax = o[i].maxApy;
  return dataMax;
};

const getDataMin = (o: ApyChartData[]): number => {
  let dataMin = getDataMax(o);
  for (let i = 0; i < o.length; i++) if (o[i].jarApr < dataMin) dataMin = o[i].jarApr;
  return dataMin;
};

export default Chart;
