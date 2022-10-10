import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "next-i18next";
import dayjs from "v1/util/dayjs";

import CustomTooltip from "./DillToolTip";
import ChartSelect, { SelectOptions } from "./ChartSelect";
import { Label, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Skeleton from "@material-ui/lab/Skeleton";
import { RadioGroup } from "@headlessui/react";

import { CoreSelectors } from "v2/store/core";
import { classNames, formatDate } from "v2/utils";
import { DillWeek } from "picklefinance-core/lib/model/PickleModelJson";

const HistoricChart: FC = () => {
  const { t } = useTranslation("common");
  const core = useSelector(CoreSelectors.selectCore);
  const [dataSeries, setDataSeries] = useState<DistributionDataPoint[]>([]);
  const [chartMode, setChartMode] = useState<ChartMode>("weekly");
  const [chart, setChart] = useState<SelectOptions | null>(null);
  useEffect(() => {
    fetchFeeDistributionSeries(chartMode);
  }, [core, chartMode]);

  const fetchFeeDistributionSeries = async (chartMode: ChartMode) => {
    const dillStats: DillWeek[] | undefined = core?.dill?.dillWeeks;
    if (!dillStats) return;
    const dillByWeek: DistributionDataPoint[] = [];
    dillStats.forEach((x, i) => {
      let rewardsUsd = x.weeklyPickleAmount * x.picklePriceUsd + x.weeklyEthAmount * x.ethPriceUsd;
      const dDate = new Date(x.distributionTime);
      let tmp = {
        ...x,
        pickleAmount: x.weeklyPickleAmount,
        ethAmount: x.weeklyEthAmount,
        dillAmount: x.weeklyDillAmount,
        distributionTime: `${dDate.getUTCFullYear()}-${
          dDate.getUTCMonth() + 1
        }-${dDate.getUTCDate()}`,
        rewardsUsd: rewardsUsd,
        totalRewardsUsd: 0,
        usdPerDill: rewardsUsd / x.totalDillAmount,
      };
      tmp.totalRewardsUsd =
        (dillByWeek[i - 1]?.totalRewardsUsd || 0) +
        tmp.pickleAmount * tmp.picklePriceUsd +
        tmp.ethAmount * tmp.ethPriceUsd;
      dillByWeek.push(tmp as DistributionDataPoint);
    });
    if (chartMode === "monthly") {
      const dillByMonth = groupMonth(dillByWeek);
      const monthKeys = Object.keys(dillByMonth) as Array<keyof typeof dillByMonth>;
      const dillByMonthAggregated = monthKeys.reduce<Array<DistributionDataPoint>>((acc, curr) => {
        const monthData = dillByMonth[curr].reduce<DistributionDataPoint>(
          (acc2, curr2, _, { length }) => {
            acc2 = {
              pickleAmount: (acc2.pickleAmount || 0) + curr2.pickleAmount,
              totalPickleAmount: curr2.totalPickleAmount || acc2.totalPickleAmount,
              dillAmount: (acc2.dillAmount || 0) + curr2.dillAmount,
              ethAmount: (acc2.ethAmount || 0) + curr2.ethAmount,
              totalDillAmount: curr2.totalDillAmount,
              pickleDillRatio: curr2.pickleDillRatio || acc2.pickleDillRatio,
              isProjected: curr2.isProjected,
              picklePriceUsd: (acc2.picklePriceUsd || 0) + curr2.picklePriceUsd / length,
              ethPriceUsd: (acc2.ethPriceUsd || 0) + curr2.ethPriceUsd / length,
              rewardsUsd: (acc2.rewardsUsd || 0) + (curr2.rewardsUsd || 0),
              totalRewardsUsd: (acc2.totalRewardsUsd || 0) + (curr2.totalRewardsUsd || 0) / length,
              distributionTime: monthToDate(curr as number).toUTCString(),
              usdPerDill: (acc2.usdPerDill || 0) + (curr2.usdPerDill || 0) / length,
            };
            return acc2;
          },
          {} as DistributionDataPoint,
        );
        return acc.concat(monthData);
      }, []);
      setDataSeries(dillByMonthAggregated);
    } else {
      setDataSeries(dillByWeek); //dillByWeek);
    }
  };
  const dataMax =
    dataSeries.length > 0 ? getDataMax(dataSeries, chart ? chart.value : "totalRewardsUsd") : 0;
  return (
    <div className="bg-background-light rounded-xl border border-foreground-alt-500 shadow p-4 sm:p-8">
      <h2 className="font-body font-bold text-xl">{t("v2.dill.historic")}</h2>
      <div className="flex justify-between">
        <DillToggle chartMode={chartMode} setChartMode={setChartMode} />
        <ChartSelect chart={chart} setChart={setChart} />
      </div>
      <aside className="h-[600px] p-4">
        {dataSeries.length > 0 ? (
          <ResponsiveContainer>
            {/* Passing in a new array object every time ensures transitions work correctly. */}
            <LineChart data={[...dataSeries]}>
              <XAxis
                dataKey="distributionTime"
                tickFormatter={(x) => dateFormatter(x, chartMode)}
                height={75}
                angle={300}
                interval={chartMode === "monthly" ? 0 : 1}
                tickMargin={35}
                tick={{ fill: "rgb(var(--color-foreground-alt-300))", dx: -25 }}
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
                padding={{ top: 20 }}
                tick={{ fill: "rgb(var(--color-foreground-alt-300))" }}
                tickCount={9}
                type="number"
              >
                <Label
                  value={t("v2.dill.totalRewardsUsd") as string}
                  position="insideLeft"
                  angle={-90}
                  fill="rgb(var(--color-foreground-alt-100))"
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <Tooltip
                content={({ active, payload }) => (
                  <CustomTooltip active={active} payload={payload} chartMode={chartMode} />
                )}
              />
              <Line
                type="linear"
                dataKey={chart ? chart.value : "totalRewardsUsd"}
                stroke="rgb(var(--color-accent))"
                strokeWidth={2}
              />
            </LineChart>
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

export type DistributionDataPoint = {
  pickleAmount: number;
  totalPickleAmount: number;
  dillAmount: number;
  ethAmount: number;
  totalDillAmount: number;
  pickleDillRatio: number;
  isProjected: boolean;
  picklePriceUsd: number;
  ethPriceUsd: number;
  rewardsUsd: number;
  totalRewardsUsd: number;
  distributionTime: string;
  usdPerDill: number;
};

const groupMonth = (dillStats: DistributionDataPoint[]) => {
  let byMonth: { [key: string]: Array<DistributionDataPoint> } = {};
  dillStats?.map((week) => {
    const date = new Date(week["distributionTime"]);
    const month = (date.getUTCFullYear() - 1970) * 12 + date.getUTCMonth();
    byMonth[month] = byMonth[month] || [];
    byMonth[month].push(week);
  });
  return byMonth;
};

const dateFormatter = (time: Date, chartMode: string): string => {
  return chartMode === "monthly" ? dayjs(time).format("MMM YYYY") : dayjs(time).format("DD MMM");
};

const monthToDate = (month: number): Date => {
  return new Date(`${(month % 12) + 1}/1/${Math.floor(month / 12 + 1970)}`);
};

interface FootnoteProps {
  series: DistributionDataPoint[];
  chartMode: ChartMode;
}

const Footnote: FC<FootnoteProps> = ({ series, chartMode }) => {
  const projectedEntry: DistributionDataPoint = (series as Array<any>).find(
    (entry: { isProjected: any }) => entry.isProjected,
  );
  const { t } = useTranslation("common");

  if (!projectedEntry) return null;

  return (
    <aside className="px-4">
      *{" "}
      {t("dill.projectedData", {
        date: dateFormatter(
          new Date((projectedEntry as DistributionDataPoint).distributionTime),
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

const getDataMax = (o: any[], key: string): number => {
  let dataMax = 0;
  for (let i = 0; i < o.length; i++) if (o[i][key] > dataMax) dataMax = o[i][key];
  return dataMax;
};

export default HistoricChart;
