import { PickleModelJson } from "picklefinance-core";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import React, { FC } from "react";
import { PieChart, Pie, ResponsiveContainer, Tooltip, LabelList } from "recharts";
import { formatPercentage } from "v2/utils";

const Chart: FC<{
  platformOrUser: "platform" | "user";
  mainnet: boolean;
  user?: UserData | undefined;
  core?: PickleModelJson.PickleModelJson;
}> = ({ platformOrUser, mainnet, user, core }) => {
  // useState for chartData, setChartData
  const data: PieChartData[] =
    platformOrUser === "platform"
      ? mainnet
        ? getMainnetPlatformWeights(core)
        : getSidechainPlatformWeights()
      : platformOrUser === "user"
      ? mainnet
        ? getMainnetUserWeights(user, core)
        : getSidechainUserWeights()
      : [];

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey="weight"
          nameKey="jar"
          cx="50%"
          cy="50%"
          outerRadius={140}
          fill="rgb(var(--color-primary))"
        >
          <LabelList dataKey="weight" position="inside" formatter={formatPercentage} />
          <LabelList dataKey="jar" position="outside" offset={20} />
        </Pie>
        <Tooltip
          labelFormatter={(label) => label.jar}
          formatter={(value: number) => formatPercentage(value)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const getMainnetPlatformWeights = (
  core: PickleModelJson.PickleModelJson | undefined,
): PieChartData[] => {
  const mainnetJars: PickleModelJson.JarDefinition[] = core
    ? core.assets.jars.filter((j) => j.chain === "eth")
    : [];
  let chartData = [];
  for (let i = 0; i < mainnetJars.length; i++) {
    if (mainnetJars[i].farm?.details?.allocShare !== undefined) {
      chartData.push({
        jar: mainnetJars[i].id,
        weight: mainnetJars[i].farm?.details?.allocShare || 0,
      });
    }
  }
  chartData = sortByWeight(chartData).slice(-15);
  console.log(chartData);
  return chartData;
};

const getSidechainPlatformWeights = (): PieChartData[] => {
  return [];
};

const getMainnetUserWeights = (
  user: UserData | undefined,
  core: PickleModelJson.PickleModelJson | undefined,
): PieChartData[] => {
  let chartData = [];
  const userVotes = user ? user.votes : [];
  for (let i = 0; i < userVotes.length; i++) {
    let jar: JarDefinition = core
      ? core.assets.jars.find((j) => j.depositToken.addr === userVotes[i].farmDepositToken) ||
        ({} as JarDefinition)
      : ({} as JarDefinition);
    chartData.push({
      jar: jar ? jar.id : "",
      weight: +userVotes[i].weight,
    });
  }
  return chartData;
};

const getSidechainUserWeights = (): PieChartData[] => {
  return [];
};

const sortByWeight = (data: PieChartData[]) =>
  data ? data.sort((a, b) => (a.weight > b.weight ? 1 : -1)) : [];

interface PieChartData {
  jar: string;
  weight: number;
}

export default Chart;
