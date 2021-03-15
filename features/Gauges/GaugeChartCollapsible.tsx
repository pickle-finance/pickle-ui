import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import { Button, Grid, Spacer, Select, Checkbox } from "@geist-ui/react";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import Chart from "react-apexcharts";
import Collapse from "../Collapsible/Collapse";

export const GaugeChartCollapsible: FC<{ gauges: UserGaugeData[] }> = ({
  gauges,
}) => {
  console.log("gggg", gauges);
  const gaugeChartData = gauges.map((gauge) => {
    const { allocPoint, depositTokenName } = gauge;
    return {
      allocPoint,
      depositTokenName,
    };
  });
  console.log("ggg", gaugeChartData);
  const chartOptions = {
    series: gaugeChartData.map((x) => x.allocPoint),
    options: {
      chart: {
        width: 480,
        type: "pie",
      },
      labels: gaugeChartData.map((x) => x.depositTokenName),
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };
  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none", flex: 1 }}
      shadow
      preview={<div>View allocation of PICKLE reward weights</div>}
    >
      <Spacer y={1} />
      {gauges?.length ? (
        <Chart
          options={chartOptions.options}
          series={chartOptions.series}
          type="pie"
          width={480}
        />
      ) : (
        "There are no active Farms"
      )}
    </Collapse>
  );
};
