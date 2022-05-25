import { FC, useState, ReactNode } from "react";
import dayjs from "v1/util/dayjs";
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
import { TFunction, useTranslation } from "next-i18next";

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

interface Entry {
  payload: FeeDistributionDataPoint;
}

const tooltipFormatter = (
  value: number,
  name: string,
  entry: Entry,
  t: TFunction,
): [string, string] => {
  const { picklePriceUsd } = entry.payload;
  const amount = value * picklePriceUsd;
  const formattedNumber = value.toLocaleString();
  const formattedDollarValue = `${formattedNumber} (${formatDollarValue(amount, 0)})`;

  switch (name) {
    case "weeklyPickleAmount":
      return [formattedDollarValue, t("dill.weeklyPickleAmount")];
    case "totalPickleAmount":
      return [formattedDollarValue, t("dill.totalPickleAmount")];
    case "weeklyDillAmount":
      return [formattedNumber, t("dill.weeklyDillAmount")];
    case "totalDillAmount":
      return [formattedNumber, t("dill.totalDillAmount")];
    case "pickleDillRatio":
      return [`${formattedNumber} (${formatDollarValue(amount, 2)})`, t("dill.pickleDillRatio")];
    default:
      return [formattedNumber, name];
  }
};

const legendFormatter = (value: string, t: TFunction): string => {
  switch (value) {
    case "weeklyPickleAmount":
      return t("dill.weeklyPickleAmount");
    case "totalPickleAmount":
      return t("dill.totalPickleAmount");
    case "weeklyDillAmount":
      return t("dill.weeklyDillAmount");
    case "totalDillAmount":
      return t("dill.totalDillAmount");
    case "pickleDillRatio":
      return t("dill.pickleDillRatio");
    default:
      return value;
  }
};

interface FootnoteProps {
  series: FeeDistributionDataPoint[];
}

const Footnote: FC<FootnoteProps> = ({ series }) => {
  const projectedEntry = series.find((entry) => entry.isProjected);
  const { t } = useTranslation("common");

  if (!projectedEntry) return null;

  return (
    <>
      <Spacer y={1} />
      <Text p>
        *{" "}
        {t("dill.projectedData", {
          date: dateFormatter(projectedEntry.distributionTime),
        })}
      </Text>
    </>
  );
};

export const FeeDistributionsChart: FC = () => {
  const { feeDistributionSeries: dataSeries } = useFeeDistributionSeries();
  const [chartMode, setChartMode] = useState<ChartMode>("weekly");
  const { t } = useTranslation("common");

  return (
    <Card>
      <h2>{t("dill.historic")}</h2>
      <Radio.Group value={chartMode} useRow onChange={(value) => setChartMode(value as ChartMode)}>
        <Radio value="weekly">{t("dill.weekly")}</Radio>
        <Radio value="total">{t("dill.total")}</Radio>
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
              <YAxis
                width={90}
                padding={{ top: 20 }}
                type="number"
                domain={[-5000, "dataMax"]}
                tickCount={9}
              >
                <Label
                  value={t("dill.tokenAmount") as string}
                  position="insideLeft"
                  angle={-90}
                  fill={accentColor}
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <YAxis width={70} yAxisId="right" orientation="right" padding={{ top: 20 }}>
                <Label
                  value={t("dill.pickleDillRatio") as string}
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
                formatter={(value: number, name: string, entry: Entry) =>
                  tooltipFormatter(value, name, entry, t)
                }
                labelFormatter={labelFormatter}
                labelStyle={{ fontWeight: "bold", color: "#666666" }}
              />
              <Legend align="left" formatter={(value: string) => legendFormatter(value, t)} />
              <Bar
                dataKey={chartMode === "weekly" ? "weeklyPickleAmount" : "totalPickleAmount"}
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
                dataKey={chartMode === "weekly" ? "weeklyDillAmount" : "totalDillAmount"}
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
