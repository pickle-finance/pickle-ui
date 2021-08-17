import { FC, useState, ReactNode } from "react";
import dayjs from "util/dayjs";
import { Card, Radio, Spacer, Text } from "@geist-ui/react";
import Skeleton from "@material-ui/lab/Skeleton";
import {
  Bar,
  Cell,
  ComposedChart,
  Label,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { accentColor, materialBlack } from "../../util/constants";
import { roundNumber } from "../../util/number";
import {
  useFeeDistributionSeries,
  FeeDistributionDataPoint,
} from "../../containers/DILL/useFeeDistributionSeries";

type ChartMode = "weekly" | "total";

const formatDollarValue = (amount: number, digits: number) =>
  `$${roundNumber(amount, digits).toLocaleString()}`;

const dateFormatter = (time: Date): string => dayjs(time).format("MMM D");
const labelFormatter = (time: Date, data: any[]): string | ReactNode => {
  const payload: FeeDistributionDataPoint | undefined = data[0]?.payload;
  const formattedTime = dateFormatter(time);

  if (payload) {
    return (
      <span>
        {formattedTime}
        <br />1 PICKLE = {formatDollarValue(payload.picklePriceUsd, 2)}
      </span>
    );
  } else {
    return formattedTime;
  }
};

const tooltipFormatter = (
  value: number,
  name: string,
  entry: { payload: FeeDistributionDataPoint },
): [string, string] => {
  const { picklePriceUsd } = entry.payload;
  const amount = value * picklePriceUsd;
  const formattedNumber = value.toLocaleString();
  const formattedDollarValue = `${formattedNumber} (${formatDollarValue(
    amount,
    0,
  )})`;

  switch (name) {
    case "weeklyPickleAmount":
      return [formattedDollarValue, "Weekly PICKLEs distributed"];
    case "totalPickleAmount":
      return [formattedDollarValue, "Total PICKLEs distributed"];
    case "weeklyDillAmount":
      return [formattedNumber, "Weekly DILL 🔒"];
    case "totalDillAmount":
      return [formattedNumber, "Total DILL 🔒"];
    case "pickleDillRatio":
      return [
        `${formattedNumber} (${formatDollarValue(amount, 2)})`,
        "PICKLEs per 1 DILL ratio",
      ];
    default:
      return [formattedNumber, name];
  }
};
const legendFormatter = (value: string): string => {
  switch (value) {
    case "weeklyPickleAmount":
      return "Weekly PICKLEs";
    case "totalPickleAmount":
      return "Total PICKLEs";
    case "weeklyDillAmount":
      return "Weekly DILL amount";
    case "totalDillAmount":
      return "Total DILL amount";
    case "pickleDillRatio":
      return "Distributed PICKLEs per 1 DILL";
    default:
      return value;
  }
};

interface FootnoteProps {
  series: FeeDistributionDataPoint[];
}

const Footnote: FC<FootnoteProps> = ({ series }) => {
  const projectedEntry = series.find((entry) => entry.isProjected);

  if (!projectedEntry) return null;

  return (
    <>
      <Spacer y={1} />
      <Text p>
        * Data for {dateFormatter(projectedEntry.distributionTime)} is
        projected.
      </Text>
    </>
  );
};

export const FeeDistributionsChart: FC = () => {
  const { feeDistributionSeries: dataSeries } = useFeeDistributionSeries();
  const [chartMode, setChartMode] = useState<ChartMode>("weekly");

  return (
    <Card>
      <h2>Historic distributions of PICKLE</h2>
      <Radio.Group
        value={chartMode}
        useRow
        onChange={(value) => setChartMode(value as ChartMode)}
      >
        <Radio value="weekly">Weekly</Radio>
        <Radio value="total">Total</Radio>
      </Radio.Group>
      <Spacer y={1} />
      <div style={{ height: 360 }}>
        {dataSeries.length > 0 ? (
          <ResponsiveContainer>
            {/* Passing in a new array object every time ensures transitions work correctly. */}
            <ComposedChart data={[...dataSeries]}>
              <XAxis
                dataKey="distributionTime"
                tickFormatter={dateFormatter}
                height={75}
                angle={300}
                interval={0}
                tickMargin={26}
              />
              <YAxis width={90} padding={{ top: 20 }}>
                <Label
                  value="Token amount"
                  position="insideLeft"
                  angle={-90}
                  fill={accentColor}
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <YAxis
                width={70}
                yAxisId="right"
                orientation="right"
                padding={{ top: 20 }}
              >
                <Label
                  value="PICKLEs per DILL"
                  position="insideRight"
                  angle={-90}
                  fill={accentColor}
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <Tooltip
                contentStyle={{
                  backgroundColor: materialBlack,
                  borderColor: accentColor,
                }}
                formatter={tooltipFormatter}
                labelFormatter={labelFormatter}
                labelStyle={{ fontWeight: "bold", color: "#666666" }}
              />
              <Legend
                align="left"
                formatter={(value: string) => legendFormatter(value)}
              />
              <Bar
                dataKey={
                  chartMode === "weekly"
                    ? "weeklyPickleAmount"
                    : "totalPickleAmount"
                }
                fill={accentColor}
              >
                {dataSeries.map((point, index) => (
                  <Cell
                    fill={accentColor}
                    opacity={point.isProjected ? 0.25 : 1}
                    key={`pickle-${index}`}
                  />
                ))}
              </Bar>
              <Bar
                dataKey={
                  chartMode === "weekly"
                    ? "weeklyDillAmount"
                    : "totalDillAmount"
                }
                fill="#ebebeb"
              >
                {dataSeries.map((point, index) => (
                  <Cell
                    fill="#ebebeb"
                    opacity={point.isProjected ? 0.25 : 1}
                    key={`dill-${index}`}
                  />
                ))}
              </Bar>
              <Line
                type="linear"
                dataKey="pickleDillRatio"
                stroke="var(--link-color)"
                yAxisId="right"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <Skeleton
            variant="rect"
            animation="wave"
            width="100%"
            height="100%"
            style={{
              backgroundColor: "#FFF",
              opacity: 0.1,
            }}
          />
        )}
      </div>
      <Footnote series={dataSeries} />
    </Card>
  );
};
