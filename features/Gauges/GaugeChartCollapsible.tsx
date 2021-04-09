import styled from "styled-components";
import dynamic from "next/dynamic";
import { useState, FC, useEffect } from "react";
import { Button, Grid, Spacer, Select, Checkbox } from "@geist-ui/react";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import Collapse from "../Collapsible/Collapse";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const shadeColor = (color, percent) => {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  var RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
};

export const GaugeChartCollapsible: FC<{ gauges: UserGaugeData[] }> = ({
  gauges,
}) => {
  const gaugeChartData = gauges
    .map((gauge) => {
      const { allocPoint, depositTokenName } = gauge;
      const rounded = Math.round(allocPoint * 100) / 100;
      return {
        allocPoint: rounded,
        depositTokenName,
      };
    })
    .sort((a, b) => b.allocPoint - a.allocPoint);

  const colors = ["#26ff91", "#48c148"];

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none", flex: 1 }}
      shadow
      preview={
        <div>
          View allocation of PICKLE reward weights &nbsp;
          <p style={{ margin: "0px" }}>(based on votes cast by DILL holders)</p>
        </div>
      }
    >
      <Spacer y={1} />
      {gauges?.length ? (
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={gaugeChartData}
                dataKey="allocPoint"
                nameKey="depositTokenName"
                outerRadius={150}
                isAnimationActive={false}
                label={(x) => x.depositTokenName}
                labelLine={false}
              >
                {gaugeChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={shadeColor(colors[index % colors.length], -index * 5)}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        "There are no active Farms"
      )}
    </Collapse>
  );
};
