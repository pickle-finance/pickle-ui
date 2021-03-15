import styled from "styled-components";
import dynamic from "next/dynamic"
import { useState, FC, useEffect } from "react";
import { Button, Grid, Spacer, Select, Checkbox } from "@geist-ui/react";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import Collapse from "../Collapsible/Collapse";
import { pickleWhite } from "../../util/constants";
const Chart = dynamic(() => import('react-apexcharts'), {ssr:false})

export const GaugeChartCollapsible: FC<{ gauges: UserGaugeData[] }> = ({
  gauges,
}) => {
  const gaugeChartData = gauges.map((gauge) => {
    const { allocPoint, depositTokenName } = gauge;
    return {
      allocPoint,
      depositTokenName,
    };
  });
  const depositTokenName = gaugeChartData.map((x) => x.depositTokenName);

  const chartOptions = {
    series: gaugeChartData.map((x) => x.allocPoint),
    options: {
      chart: {
        width: 480,
        type: "pie",
      },
      labels: depositTokenName,
      dataLabels: {
        formatter(val, opts) {
          const name = depositTokenName[opts.seriesIndex];
          return [name, val.toFixed(1) + "%"];
        },
        style: {
          colors: [pickleWhite],
          fontSize: '10px'
        },
      },
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
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
