import { FC, ReactNode, useEffect, useState } from "react";
import { TFunction, useTranslation } from "next-i18next";
import dayjs from "v1/util/dayjs";
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
import { useSelector } from "react-redux";
import Skeleton from "@material-ui/lab/Skeleton";
import { RadioGroup } from "@headlessui/react";

import { CoreSelectors } from "v2/store/core";
import { roundNumber } from "v1/util/number";
import { classNames } from "v2/utils";

interface Entry {
  payload: MonthlyDistributionDataPoint;
}

export type WeeklyFeeDistributionDataPoint = {
  weeklyPickleAmount: number;
  totalPickleAmount: number;
  weeklyDillAmount: number;
  totalDillAmount: number;
  pickleDillRatio: number;
  isProjected: boolean;
  picklePriceUsd: number;
  distributionTime: string;
};

export type MonthlyDistributionDataPoint = {
  monthlyPickleAmount: number;
  totalPickleAmount: number;
  monthlyDillAmount: number;
  totalDillAmount: number;
  pickleDillRatio: number;
  isProjected: boolean;
  picklePriceUsd: number;
  distributionMonth: number;
};

const groupMonth = (dillStats: WeeklyFeeDistributionDataPoint[]) => {
  let bymonth: { [key: string]: Array<WeeklyFeeDistributionDataPoint> } = {};
  dillStats?.map((week) => {
    const date = new Date(week["distributionTime"]);
    const month = (date.getFullYear() - 1970) * 12 + date.getMonth();
    bymonth[month] = bymonth[month] || [];
    bymonth[month].push(week);
  });
  return bymonth;
};
const formatDollarValue = (amount: number, digits: number) =>
  `$${roundNumber(amount, digits).toLocaleString()}`;

const dateFormatter = (time: Date, chartMode: string): string => {
  if (!time) return "";
  return chartMode === "monthly" ? dayjs(time).format("MMM YYYY") : dayjs(time).format("DD MMM");
};

const monthToDate = (month: number): Date =>
  new Date(`${(month % 12) + 1}/1/${Math.floor(month / 12 + 1970)}`);

const labelFormatter = (monthOrDate: any, data: any[]): string | ReactNode => {
  const payload: MonthlyDistributionDataPoint | undefined = data[0]?.payload;

  const chartMode = payload?.distributionMonth ? "monthly" : "weekly";
  const time = chartMode === "monthly" ? monthToDate(monthOrDate) : new Date(monthOrDate);
  const formattedTime = dateFormatter(time, chartMode);

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
  entry: Entry,
  t: TFunction,
): [string, string] => {
  const { picklePriceUsd } = entry.payload;
  const amount = value * picklePriceUsd;
  const formattedNumber = value.toLocaleString();
  const formattedDollarValue = `${formattedNumber} (${formatDollarValue(amount, 0)})`;

  switch (name) {
    case "monthlyPickleAmount":
      return [formattedDollarValue, t("v2.dill.monthlyPickleAmount")];
    case "monthlyDillAmount":
      return [formattedNumber, t("v2.dill.monthlyDillAmount")];
    case "weeklyPickleAmount":
      return [formattedDollarValue, t("v2.dill.weeklyPickleAmount")];
    case "weeklyDillAmount":
      return [formattedNumber, t("v2.dill.weeklyDillAmount")];
    case "pickleDillRatio":
      return [`${formattedNumber} (${formatDollarValue(amount, 2)})`, t("v2.dill.pickleDillRatio")];
    default:
      return [formattedNumber, name];
  }
};

const legendFormatter = (value: string, t: TFunction): ReactNode => {
  let result: string;

  switch (value) {
    case "monthlyPickleAmount":
      result = t("v2.dill.monthlyPickleAmount");
      break;
    case "monthlyDillAmount":
      result = t("v2.dill.monthlyDillAmount");
      break;
    case "weeklyPickleAmount":
      result = t("v2.dill.weeklyPickleAmount");
      break;
    case "weeklyDillAmount":
      result = t("v2.dill.weeklyDillAmount");
      break;
    case "pickleDillRatio":
      result = t("v2.dill.pickleDillRatio");
      break;
    default:
      result = value;
  }

  return <span className="text-foreground-alt-200">{result}</span>;
};

interface FootnoteProps {
  series: MonthlyDistributionDataPoint[] | WeeklyFeeDistributionDataPoint[];
  chartMode: ChartMode;
}

const Footnote: FC<FootnoteProps> = ({ series, chartMode }) => {
  const projectedEntry:
    | MonthlyDistributionDataPoint
    | WeeklyFeeDistributionDataPoint = (series as Array<any>).find(
    (entry: { isProjected: any }) => entry.isProjected,
  );
  const { t } = useTranslation("common");

  if (!projectedEntry) return null;

  return (
    <aside className="px-4">
      *{" "}
      {t("dill.projectedData", {
        date:
          chartMode === "monthly"
            ? dateFormatter(
                monthToDate((projectedEntry as MonthlyDistributionDataPoint).distributionMonth),
                chartMode,
              )
            : dateFormatter(
                new Date((projectedEntry as WeeklyFeeDistributionDataPoint).distributionTime),
                chartMode,
              ),
      })}
    </aside>
  );
};

interface DillToggleProps {
  chartMode: string;
  setChartMode: React.Dispatch<React.SetStateAction<any>>;
}

const DillToggle: FC<DillToggleProps> = ({ chartMode, setChartMode }) => {
  const { t } = useTranslation("common");

  const options = [
    { value: t("v2.time.weekly"), key: "weekly" },
    { value: t("v2.time.monthly"), key: "monthly" },
  ];

  return (
    <RadioGroup value={chartMode} onChange={setChartMode} className="pt-4">
      <div className="flex">
        <RadioGroup.Option
          key="weekly"
          value="weekly"
          className={({ checked }) =>
            classNames(
              checked ? "bg-accent" : "bg-background-light hover:bg-background-lightest",
              "border-y border-l border-accent font-title rounded-l-full cursor-pointer text-foreground py-3 px-6 flex items-center justify-center text-sm font-medium",
            )
          }
        >
          <RadioGroup.Label as="div">
            <p>{t("v2.time.weekly")}</p>
          </RadioGroup.Label>
        </RadioGroup.Option>

        <RadioGroup.Option
          key="monthly"
          value="monthly"
          className={({ checked }) =>
            classNames(
              checked ? "bg-accent" : "bg-background-light hover:bg-background-lightest",
              "border-y border-r border-accent font-title rounded-r-full cursor-pointer text-foreground py-3 px-6 flex items-center justify-center text-sm font-medium",
            )
          }
        >
          <RadioGroup.Label as="div">
            <p>{t("v2.time.monthly")}</p>
          </RadioGroup.Label>
        </RadioGroup.Option>
      </div>
    </RadioGroup>
  );
};

type ChartMode = "monthly" | "weekly";

const HistoricChart: FC = () => {
  const { t } = useTranslation("common");
  const core = useSelector(CoreSelectors.selectCore);
  const [dataSeries, setDataSeries] = useState<
    MonthlyDistributionDataPoint[] | WeeklyFeeDistributionDataPoint[]
  >([]);
  const [chartMode, setChartMode] = useState<ChartMode>("monthly");

  useEffect(() => {
    fetchFeeDistributionSeries(chartMode);
  }, [core, chartMode]);

  const fetchFeeDistributionSeries = async (chartMode: ChartMode) => {
    const dillStats = core?.dill?.dillWeeks;
    if (!dillStats) return;
    const dillByWeek: WeeklyFeeDistributionDataPoint[] = dillStats.map((x) => {
      return {
        ...x,
        distributionTime: x.distributionTime.toString().split("T")[0],
      };
    });
    if (chartMode === "monthly") {
      const dillByMonth = groupMonth(dillByWeek);
      const monthKeys = Object.keys(dillByMonth) as Array<keyof typeof dillByMonth>;
      const dillByMonthAggregated = monthKeys.reduce<Array<MonthlyDistributionDataPoint>>(
        (acc, curr) => {
          const monthData = dillByMonth[curr].reduce<MonthlyDistributionDataPoint>(
            (acc2, curr2, _, { length }) => {
              acc2 = {
                monthlyPickleAmount: (acc2.monthlyPickleAmount || 0) + curr2.weeklyPickleAmount,
                totalPickleAmount: curr2.totalPickleAmount || acc2.totalPickleAmount,
                monthlyDillAmount: (acc2.monthlyDillAmount || 0) + curr2.weeklyDillAmount,
                totalDillAmount: curr2.totalDillAmount,
                pickleDillRatio: curr2.pickleDillRatio || acc2.pickleDillRatio,
                isProjected: curr2.isProjected,
                picklePriceUsd: (acc2.picklePriceUsd || 0) + curr2.picklePriceUsd / length,
                distributionMonth: curr as number,
              };
              return acc2;
            },
            {} as MonthlyDistributionDataPoint,
          );
          return acc.concat(monthData);
        },
        [],
      );
      setDataSeries(dillByMonthAggregated);
    } else {
      setDataSeries(dillByWeek);
    }
  };

  return (
    <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
      <h2 className="font-body font-bold text-xl">{t("v2.dill.historic")}</h2>
      <DillToggle chartMode={chartMode} setChartMode={setChartMode} />
      <aside className="h-[600px] px-3 py-2">
        {dataSeries.length > 0 ? (
          <ResponsiveContainer>
            {/* Passing in a new array object every time ensures transitions work correctly. */}
            <ComposedChart data={[...dataSeries]}>
              <XAxis
                dataKey={chartMode === "monthly" ? "distributionMonth" : "distributionTime"}
                tickFormatter={(x, index) =>
                  dateFormatter(
                    chartMode === "monthly" ? monthToDate(x) : index % 2 ? x : null,
                    chartMode,
                  )
                }
                height={75}
                angle={300}
                interval={0}
                tickMargin={35}
                tick={{ fill: "rgb(var(--color-foreground-alt-300))" }}
              />
              <YAxis
                width={100}
                padding={{ top: 50 }}
                tick={{ fill: "rgb(var(--color-foreground-alt-300))" }}
                type="number"
                /**
                 * If the y-axis looks broken it's most likely due to one data point
                 * being outside of this domain and it needs to be adjusted.
                 */
                domain={[-10000, 810000]}
                tickCount={9}
              >
                <Label
                  value={t("v2.dill.tokenAmount") as string}
                  position="insideLeft"
                  angle={-90}
                  fill="rgb(var(--color-foreground-alt-100))"
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <YAxis
                width={100}
                yAxisId="right"
                orientation="right"
                padding={{ top: 20 }}
                tick={{ fill: "rgb(var(--color-foreground-alt-300))" }}
              >
                <Label
                  value={t("v2.dill.pickleDillRatio") as string}
                  position="insideRight"
                  angle={-90}
                  fill="rgb(var(--color-foreground-alt-100))"
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--color-foreground-alt-500))",
                  borderColor: "rgb(var(--color-foreground-alt-500))",
                  borderRadius: 10,
                }}
                formatter={(value: number, name: string, entry: Entry) =>
                  tooltipFormatter(value, name, entry, t)
                }
                labelFormatter={labelFormatter}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend
                align="center"
                verticalAlign="top"
                formatter={(value: string) => legendFormatter(value, t)}
              />
              <Bar
                dataKey={chartMode === "monthly" ? "monthlyDillAmount" : "weeklyDillAmount"}
                fill="rgb(var(--color-primary-dark))"
                radius={[10, 10, 0, 0]}
              >
                {dataSeries.map((point, index) => (
                  <Cell
                    fill="rgb(var(--color-primary-dark))"
                    opacity={point.isProjected ? 0.25 : 1}
                    key={`dill-${index}`}
                  />
                ))}
              </Bar>
              <Bar
                dataKey={chartMode === "monthly" ? "monthlyPickleAmount" : "weeklyPickleAmount"}
                fill="rgb(var(--color-primary-light))"
                radius={[10, 10, 0, 0]}
              >
                {dataSeries.map((point, index) => (
                  <Cell
                    fill="rgb(var(--color-primary-light))"
                    opacity={point.isProjected ? 0.25 : 1}
                    key={`pickle-${index}`}
                  />
                ))}
              </Bar>
              <Line
                type="linear"
                dataKey="pickleDillRatio"
                stroke="rgb(var(--color-accent))"
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
      </aside>
      <Footnote series={dataSeries} chartMode={chartMode} />
    </div>
  );
};

export default HistoricChart;
