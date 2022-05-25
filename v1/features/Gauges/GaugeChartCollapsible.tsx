import { FC } from "react";
import { Spacer, Table } from "@geist-ui/react";
import { UserGaugeData } from "../../containers/UserGauges";
import Collapse from "../Collapsible/Collapse";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import styled from "styled-components";
import { Trans, useTranslation } from "next-i18next";

const shadeColor = (color: string, percent: number) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.round((R * (100 + percent)) / 100);
  G = Math.round((G * (100 + percent)) / 100);
  B = Math.round((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  var RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
};

const formatter = (val: number) => {
  const pct = val * 100;
  if (pct < 0.01 && pct > 0) {
    return "~0.00%";
  }
  return pct.toFixed(2) + "%";
};

const TableContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const GaugeChartCollapsible: FC<{ gauges: UserGaugeData[] }> = ({ gauges }) => {
  const { t } = useTranslation("common");

  const gaugeChartData = gauges
    .map((gauge) => {
      const { allocPoint, depositTokenName } = gauge;
      return {
        allocPoint,
        depositTokenName,
      };
    })
    .sort((a, b) => b.allocPoint - a.allocPoint);

  const dataForChart = gaugeChartData.filter((x) => x.allocPoint > 0.02);
  const dataForTable = gaugeChartData.filter((x) => !dataForChart.includes(x));

  const smallFarmsData = dataForTable?.reduce(
    (acc, cur) => {
      return {
        allocPoint: acc.allocPoint + cur.allocPoint,
        depositTokenName: t("gauges.other"),
      };
    },
    { allocPoint: 0, depositTokenName: t("gauges.other") },
  );

  dataForChart.push(smallFarmsData);

  const colors = ["#26ff91", "#48c148"];

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none", flex: 1 }}
      shadow
      preview={
        <div>
          <Trans i18nKey="gauges.chartPreview">
            View allocation of PICKLE reward weights
            <p style={{ margin: "0px" }}>(based on votes cast by DILL holders)</p>
          </Trans>
        </div>
      }
    >
      <Spacer y={1} />
      {gauges?.length ? (
        <>
          <div style={{ width: "100%", height: 500 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dataForChart}
                  dataKey="allocPoint"
                  nameKey="depositTokenName"
                  outerRadius={150}
                  isAnimationActive={false}
                  label={(x) => x.depositTokenName}
                  labelLine={false}
                >
                  {dataForChart.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={shadeColor(colors[index % colors.length], -index * 3)}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={formatter} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <TableContainer>
            <div style={{ width: "70%" }}>
              <Table
                data={dataForTable.map((entry) => ({
                  ...entry,
                  allocPoint: formatter(entry.allocPoint),
                }))}
              >
                <Table.Column prop="depositTokenName" label={t("gauges.token")} />
                <Table.Column prop="allocPoint" label={t("gauges.weight")} />
              </Table>
            </div>
          </TableContainer>
        </>
      ) : (
        t("farms.noneActive")
      )}
    </Collapse>
  );
};
