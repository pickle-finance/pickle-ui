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
  const rewardsSummedByToken = sumRewardsByToken(lastTxn.pnlRollingDataWithLots.rollingRewards);
  const totalRewards = Object.values(rewardsSummedByToken).reduce((acc, curr) => acc + curr);
  return (
    <div className="p-4">
      <h3>Summary</h3>
      <div className="flex">
        <div>
          <p className="pr-4">Open Jar Tokens - {jarTokens}</p>
          <p className="pr-4">Cost of Open Position - {formatDollars(currentCost)}</p>
          <p className="pr-4">Value of Open Position - {formatDollars(currentUSDValue)}</p>
          <p>Unrealized Gain/Loss - {formatDollars(currentUSDValue - currentCost)}</p>
        </div>
        <div>
          <p>Realized Gain/Loss - {sumPnl(lastTxn.pnlRollingDataWithLots.lots)}</p>
          <p className="pr-4">Total Rewards Received - {formatDollars(totalRewards, 2)}</p>
        </div>
      </div>
    </div>
  );
};

const sumRewardsByToken = (rewards: StakingRewards) => {
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
  return formatDollars(realizedProfit, 2);
};

export default CurrentSummary;
