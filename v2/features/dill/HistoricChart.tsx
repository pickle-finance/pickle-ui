import { FC, ReactNode, useEffect, useState } from "react";
import { TFunction, useTranslation } from "next-i18next";
import dayjs from "util/dayjs";
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
import { DillWeek } from "picklefinance-core/lib/model/PickleModelJson";
import Skeleton from "@material-ui/lab/Skeleton";

import { CoreSelectors } from "v2/store/core";
import { roundNumber } from "util/number";
import {
  grayDark,
  grayLighter,
  greenDark,
  greenLight,
  orange,
} from "v2/utils/theme";

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
  distributionTime: Date;
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

const groupMonth = (dillStats: DillWeek[]) => {
  let bymonth: { [key: string]: Array<WeeklyFeeDistributionDataPoint> } = {};
  dillStats?.map((week) => {
    const date = new Date(week["distributionTime"]);
    const month = (date.getFullYear() - 1970) * 12 + date.getMonth();
    bymonth[month] = bymonth[month] || [];
    bymonth[month].push(week);
  });
  return bymonth;
};
interface FootnoteProps {
  series: MonthlyDistributionDataPoint[];
}

const formatDollarValue = (amount: number, digits: number) =>
  `$${roundNumber(amount, digits).toLocaleString()}`;

const dateFormatter = (time: Date): string => dayjs(time).format("MMM YYYY");

const monthToDate = (month: number): Date =>
  new Date(`${(month % 12) + 1}/1/${Math.floor(month / 12 + 1970)}`);

const labelFormatter = (month: number, data: any[]): string | ReactNode => {
  const time = monthToDate(month);
  const payload: MonthlyDistributionDataPoint | undefined = data[0]?.payload;
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
  entry: Entry,
  t: TFunction,
): [string, string] => {
  const { picklePriceUsd } = entry.payload;
  const amount = value * picklePriceUsd;
  const formattedNumber = value.toLocaleString();
  const formattedDollarValue = `${formattedNumber} (${formatDollarValue(
    amount,
    0,
  )})`;

  switch (name) {
    case "monthlyPickleAmount":
      return [formattedDollarValue, t("dill.monthlyPickleAmount")];
    case "totalPickleAmount":
      return [formattedDollarValue, t("dill.totalPickleAmount")];
    case "monthlyDillAmount":
      return [formattedNumber, t("dill.monthlyDillAmount")];
    case "totalDillAmount":
      return [formattedNumber, t("dill.totalDillAmount")];
    case "pickleDillRatio":
      return [
        `${formattedNumber} (${formatDollarValue(amount, 2)})`,
        t("dill.pickleDillRatio"),
      ];
    default:
      return [formattedNumber, name];
  }
};

const legendFormatter = (value: string, t: TFunction): string => {
  switch (value) {
    case "monthlyPickleAmount":
      return t("dill.monthlyPickleAmount");
    case "totalPickleAmount":
      return t("dill.totalPickleAmount");
    case "monthlyDillAmount":
      return t("dill.monthlyDillAmount");
    case "totalDillAmount":
      return t("dill.totalDillAmount");
    case "pickleDillRatio":
      return t("dill.pickleDillRatio");
    default:
      return value;
  }
};

const Footnote: FC<FootnoteProps> = ({ series }) => {
  const projectedEntry = series.find((entry) => entry.isProjected);
  const { t } = useTranslation("common");

  if (!projectedEntry) return null;

  return (
    <aside className="px-4">
      *{" "}
      {t("dill.projectedData", {
        date: dateFormatter(monthToDate(projectedEntry.distributionMonth)),
      })}
    </aside>
  );
};

type ChartMode = "monthly" | "weekly";

const HistoricChart: FC = () => {
  const { t } = useTranslation("common");
  const core = useSelector(CoreSelectors.selectCore);
  const [dataSeries, setDataSeries] = useState<MonthlyDistributionDataPoint[]>(
    [],
  );
  const [chartMode] = useState<ChartMode>("monthly");

  useEffect(() => {
    fetchFeeDistributionSeries();
  }, [core]);

  const fetchFeeDistributionSeries = async () => {
    const dillStats = core?.dill?.dillWeeks!;
    const dillByMonth = groupMonth(dillStats);
    const monthKeys = Object.keys(dillByMonth) as Array<
      keyof typeof dillByMonth
    >;
    const dillByMonthAggregated = monthKeys.reduce<
      Array<MonthlyDistributionDataPoint>
    >((acc, curr) => {
      const monthData = dillByMonth[curr].reduce<MonthlyDistributionDataPoint>(
        (acc2, curr2, _, { length }) => {
          acc2 = {
            monthlyPickleAmount:
              (acc2.monthlyPickleAmount || 0) + curr2.weeklyPickleAmount,
            totalPickleAmount: curr2.totalPickleAmount,
            monthlyDillAmount:
              (acc2.monthlyDillAmount || 0) + curr2.weeklyDillAmount,
            totalDillAmount: curr2.totalDillAmount,
            pickleDillRatio: curr2.pickleDillRatio,
            isProjected: curr2.isProjected,
            picklePriceUsd:
              (acc2.picklePriceUsd || 0) + curr2.picklePriceUsd / length,
            distributionMonth: curr as number,
          };
          return acc2;
        },
        {} as MonthlyDistributionDataPoint,
      );
      return acc.concat(monthData);
    }, []);
    setDataSeries(dillByMonthAggregated);
  };

  return (
    <div className="bg-black-light rounded-xl border border-gray-dark shadow p-4 sm:p-8">
      <h2 className="font-body font-bold text-xl">{t("v2.dill.historic")}</h2>
      <aside className="h-[600px] px-3 py-10">
        {dataSeries.length > 0 ? (
          <ResponsiveContainer>
            {/* Passing in a new array object every time ensures transitions work correctly. */}
            <ComposedChart data={[...dataSeries]}>
              <XAxis
                dataKey="distributionMonth"
                tickFormatter={(x) => dateFormatter(monthToDate(x))}
                height={75}
                angle={300}
                interval={0}
                tickMargin={35}
              />
              <YAxis
                width={100}
                padding={{ top: 50 }}
                type="number"
                domain={[0, 300000]}
                tickCount={9}
              >
                <Label
                  value={t("dill.tokenAmount") as string}
                  position="insideLeft"
                  angle={-90}
                  fill={grayLighter}
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <YAxis
                width={100}
                yAxisId="right"
                orientation="right"
                padding={{ top: 20 }}
              >
                <Label
                  value={t("dill.pickleDillRatio") as string}
                  position="insideRight"
                  angle={-90}
                  fill={grayLighter}
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <Tooltip
                contentStyle={{
                  backgroundColor: grayDark,
                  borderColor: grayLighter,
                  borderRadius: "10px 10px 10px 10px",
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
                dataKey={
                  chartMode === "monthly"
                    ? "monthlyDillAmount"
                    : "totalDillAmount"
                }
                fill={greenDark}
                radius={[10, 10, 0, 0]}
              >
                {dataSeries.map((_, index) => (
                  <Cell fill={greenDark} key={`dill-${index}`} />
                ))}
              </Bar>
              <Bar
                dataKey={
                  chartMode === "monthly"
                    ? "monthlyPickleAmount"
                    : "totalPickleAmount"
                }
                fill={greenLight}
                radius={[10, 10, 0, 0]}
              >
                {dataSeries.map((_, index) => (
                  <Cell fill={greenLight} key={`pickle-${index}`} />
                ))}
              </Bar>
              <Line
                type="linear"
                dataKey="pickleDillRatio"
                stroke={orange}
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
      <Footnote series={dataSeries} />
    </div>
  );
};

export default HistoricChart;
