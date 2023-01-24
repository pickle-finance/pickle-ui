import {
  Lot,
  PnlTransactionWrapper,
  StakingRewards,
} from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { FC } from "react";
import { formatDollars } from "v2/utils";

const CurrentSummary: FC<{ lastTxn: PnlTransactionWrapper; jar: JarDefinition }> = ({
  lastTxn,
  jar,
}) => {
  const currentCost = lastTxn.pnlRollingDataWithLots.costOfOpenPositions;
  const jarTokens = lastTxn.pnlRollingDataWithLots.rollingWeiCount.toString();
  const currentUSDValue =
    lastTxn.pnlRollingDataWithLots.rollingWeiCount.gt(0) && jar.depositToken.price
      ? lastTxn.pnlRollingDataWithLots.rollingWeiCount.mul(jar.depositToken.price).toNumber()
      : 0;
  console.log("rolling data: " + JSON.stringify(lastTxn.pnlRollingDataWithLots));
  const rewardsSummedByToken = sumRewardsByToken(lastTxn.pnlRollingDataWithLots.rollingRewards);
  console.log("rewardsSummedByToken: " + JSON.stringify(rewardsSummedByToken));
  const totalRewards = Object.values(rewardsSummedByToken).reduce((acc, curr) => acc + curr);
  return (
    <div className="p-4 mb-12 text-center border border-foreground-alt-200 rounded-xl">
      <h3 className="text-3xl mb-5 text-foreground-alt-200 underline">Summary</h3>
      <div className="w-full flex justify-between px-24">
        <SummaryCard value={jarTokens} label={"Jar Tokens"} />
        <SummaryCard value={formatDollars(currentCost)} label={"Cost"} />
        <SummaryCard value={formatDollars(currentUSDValue)} label={"Value"} />
        <SummaryCard
          value={formatDollars(currentUSDValue - currentCost)}
          label={"Unrealized Gain/Loss"}
        />
        <SummaryCard value={formatDollars(totalRewards)} label={"Total Rewards"} />
        <SummaryCard
          value={sumPnl(lastTxn.pnlRollingDataWithLots.lots)}
          label={"Realized Gain/Loss"}
        />
      </div>
    </div>
  );
};

const SummaryCard: FC<{ value: any; label: string }> = ({ value, label }) => (
  <div className="bg-background-light rounded-3xl text-center text-foreground-alt-200 w-min p-4">
    <p className="text-6xl pb-2">{value}</p>
    <p className="text-xs">{label}</p>
  </div>
);

const sumRewardsByToken = (rewards: StakingRewards) => {
  console.log("sumRewardsByToken: " + JSON.stringify(rewards));

  const rewardsSummedByToken: { [tokenAddr: string]: number } = {};
  Object.keys(rewards).forEach((token) => {
    let tokenRewards = 0;
    rewards[token].forEach((r) => (tokenRewards += r.value));
    rewardsSummedByToken[token] = tokenRewards;
  });
  return rewardsSummedByToken;
};

const sumPnl = (lots: Lot[]) => {
  let realizedProfit = 0;
  lots.forEach((l) => (realizedProfit += l.saleProceedsUSD - l.totalCostUsd));
  return formatDollars(realizedProfit);
};

export default CurrentSummary;
