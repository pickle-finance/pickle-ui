import React, { FC } from "react";
import { PickleModelJson } from "picklefinance-core";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { JarDefinition, PickleAsset } from "picklefinance-core/lib/model/PickleModelJson";
import { iOffchainVoteData, JarVote, UserVote } from "v2/store/offchainVotes";

import { PieChart, Pie, ResponsiveContainer, Tooltip, LabelList } from "recharts";
import { formatPercentage } from "v2/utils";
import { BigNumber } from "ethers";

const Chart: FC<{
  platformOrUser: "platform" | "user";
  mainnet: boolean;
  user?: UserData | undefined;
  core?: PickleModelJson.PickleModelJson;
  wallet?: string | undefined | null;
  offchainVoteData?: iOffchainVoteData | undefined;
}> = ({ platformOrUser, mainnet, user, core, wallet, offchainVoteData }) => {
  // useState for chartData, setChartData
  const data: PieChartData[] =
    platformOrUser === "platform"
      ? mainnet
        ? getMainnetPlatformWeights(core)
        : getSidechainPlatformWeights(offchainVoteData)
      : platformOrUser === "user"
      ? mainnet
        ? getMainnetUserWeights(user, core)
        : getSidechainUserWeights(offchainVoteData, wallet)
      : [];
  if (data.length < 1)
    return (
      <div className="h-full">
        <p className="text-center">Vote Data Unavailable</p>
      </div>
    );
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

const stringForAsset = (asset: PickleAsset): string => {
  return asset.details?.apiKey ? asset.details.apiKey + " (" + asset.id + ")" : asset.id;
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
        jar: stringForAsset(mainnetJars[i]),
        weight: mainnetJars[i].farm?.details?.allocShare || 0,
      });
    }
  }
  chartData = sortByWeight(chartData)
    .filter((v) => v.weight > 0.01)
    .slice(-15);
  return chartData;
};

const getSidechainPlatformWeights = (
  offchainVoteData: iOffchainVoteData | undefined,
): PieChartData[] => {
  const platformWeights = offchainVoteData ? offchainVoteData.chains || [] : [];
  let chartData = [];
  for (let c = 0; c < platformWeights.length; c++) {
    const jarVotes: JarVote[] = platformWeights[c].jarVotes;
    for (let j = 0; j < jarVotes.length; j++) {
      chartData.push({
        jar: jarVotes[j].key,
        weight: jarVotes[j].jarVoteAsEmissionShare,
      });
    }
  }
  chartData = sortByWeight(chartData)
    .filter((v) => v.weight > 0.01)
    .slice(-15);
  return chartData;
};

const getMainnetUserWeights = (
  user: UserData | undefined,
  core: PickleModelJson.PickleModelJson | undefined,
): PieChartData[] => {
  let chartData = [];
  if (user && core) {
    let totalWeight = BigNumber.from("0");
    for (let i = 0; i < user.votes.length; i++)
      totalWeight = totalWeight.add(BigNumber.from(user.votes[i].weight));

    for (let i = 0; i < user.votes.length; i++) {
      let jar: JarDefinition | undefined = core.assets.jars.find(
        (j) => j.contract.toLowerCase() === user.votes[i].farmDepositToken.toLowerCase(),
      );
      let jarWeight =
        BigNumber.from(user.votes[i].weight).mul(10000).div(totalWeight).toNumber() / 10000;
      if (jar)
        chartData.push({
          jar: stringForAsset(jar),
          weight: jarWeight,
        });
    }
  }
  return chartData;
};

const getSidechainUserWeights = (
  offchainVoteData: iOffchainVoteData | undefined,
  wallet: string | undefined | null,
): PieChartData[] => {
  let userVote: UserVote = {} as UserVote;
  const allVotes = offchainVoteData ? offchainVoteData.votes : [];
  if (offchainVoteData && wallet) {
    for (let i = 0; i < allVotes.length; i++) {
      if (allVotes[i].wallet.toLowerCase() === wallet.toLowerCase()) userVote = allVotes[i];
    }
  }
  const chartData: PieChartData[] | undefined = userVote?.jarWeights?.map((v) => ({
    jar: v.jarKey,
    weight: (v.weight > 0 ? v.weight : v.weight * -1) * 0.01,
  }));
  return chartData ? chartData : [];
};

const sortByWeight = (data: PieChartData[]) =>
  data ? data.sort((a, b) => (a.weight > b.weight ? 1 : -1)) : [];

interface PieChartData {
  jar: string;
  weight: number;
}

export default Chart;
