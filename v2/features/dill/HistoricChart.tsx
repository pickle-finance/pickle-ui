import { FC } from "react";

import { classNames } from "v2/utils";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  active?: boolean;
}

const HistoricChart: FC<Props> = ({ active }) => {
  const data = [
    {
      month: "January",
      amt: 42,
      uv: 40,
    },
    {
      month: "February",
      amt: 30,
      uv: 28,
    },
    {
      month: "March",
      amt: 25,
      uv: 20,
    },
    {
      month: "May",
      amt: 38,
      uv: 27,
    },
    {
      month: "June",
      amt: 45,
      uv: 18,
    },
  ];

  return (
    <div
      className={classNames(
        active ? "bg-green" : "bg-gray-outline",
        "rounded-xl py-1 px-2",
      )}
    >
      <h1 style={{paddingLeft: '2rem'}}>Historic distributions of PICKLE</h1>
      <ResponsiveContainer width="97%" height={400}>

      <BarChart width={500} height={400} data={data}>
        <CartesianGrid />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend verticalAlign="top" height={50} />
        <Bar dataKey="amt" fill="#065506" barSize={40} radius={[10, 10, 0, 0]} />
        <Bar dataKey="uv" fill="#47c346" barSize={40} radius={[10, 10, 0, 0]} />
      </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricChart;
