import { BigNumber, ethers } from "ethers";
import {
  Lot,
  PnlTransactionWrapper,
  StakingRewards,
} from "picklefinance-core/lib/client/pnl/UserHistoryInterfaces";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
import { FC } from "react";
import { formatDollarsAddDecimalsForSmallNumbers, weiToVisibleString } from "v2/utils";

const CurrentSummary: FC<{ lastTxn: PnlTransactionWrapper; jar: JarDefinition }> = ({
  lastTxn,
  jar,
}) => {
  const currentCost = lastTxn.pnlRollingDataWithLots.costOfOpenPositions;
  const decimals = jar.details.decimals || jar.depositToken.decimals || 18;
  const jarTokens = weiToVisibleString(lastTxn.pnlRollingDataWithLots.rollingWeiCount.toString(), decimals);
  const currentUSDValue = (jar.details.ratio || 1) * 
    (lastTxn.pnlRollingDataWithLots.rollingWeiCount.gt(0) && jar.depositToken.price
      ? weiMulPriceInDollars(lastTxn.pnlRollingDataWithLots.rollingWeiCount, jar.depositToken.price, decimals)
      : 0);
  // console.log("rolling data: " + JSON.stringify(lastTxn.pnlRollingDataWithLots));
  const rewardsSummedByToken = sumRewardsByToken(lastTxn.pnlRollingDataWithLots.rollingRewards);
  // console.log("rewardsSummedByToken: " + JSON.stringify(rewardsSummedByToken));
  const totalRewards = Object.values(rewardsSummedByToken).reduce((acc, curr) => acc + curr, 0);
  const safeJarName = jar.depositToken?.name || " this jar";
  return (
    <div className="p-4 mb-12 text-center border border-foreground-alt-200 rounded-xl">
      <h3 className="text-3xl mb-5 text-foreground-alt-200 underline">Your Summary for {safeJarName}</h3>
      <div className="w-full flex justify-between px-24">
        <SummaryCard value={jarTokens} label={"Jar Token Balance"} />
        <SummaryCard value={formatDollarsAddDecimalsForSmallNumbers(currentCost, 2)} label={"Balance Cost"} />
        <SummaryCard value={formatDollarsAddDecimalsForSmallNumbers(currentUSDValue, 2)} label={"Balance Value"} />
        <SummaryCard
          value={formatDollarsAddDecimalsForSmallNumbers(currentUSDValue - currentCost, 2)}
          label={"Unrealized Gain/Loss"}
        />
        <SummaryCard value={formatDollarsAddDecimalsForSmallNumbers(totalRewards, 2)} label={"Total Rewards"} />
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
  for( let i = 0; i < lots.length; i++ ) {
    if( lots[i].status === 'closed') {
      realizedProfit += lots[i].saleProceedsUSD - lots[i].totalCostUsd;
    } else {
      const fractionOpen = lots[i].weiRemaining.mul(1000).div(lots[i].wei).toNumber() / 1000;
      const fractionClosed = 1 - fractionOpen;
      const costFraction = lots[i].totalCostUsd * fractionClosed;
      realizedProfit += lots[i].saleProceedsUSD - costFraction;
    }
  }
  return formatDollarsAddDecimalsForSmallNumbers(realizedProfit, 2);
};

const weiMulPriceInDollars = (numWei: BigNumber, tokenPrice: number, decimals: number) => {
  try {
    //    console.log("1:   " + wei + ", " + decimals + ", " + tokenPrice);
    const log = Math.log(tokenPrice) / Math.log(10);
    const precisionAdjust = log > 4 ? 0 : 5 - Math.floor(log);
    const precisionAsNumber = Math.pow(10, precisionAdjust);
    const tokenPriceWithPrecision = (tokenPrice * precisionAsNumber).toFixed();
    //    console.log("2:    " + tokenPrice + ", " + log + ", " + precisionAdjust + ", " + precisionAsNumber + ", " + tokenPriceWithPrecision + ", " + precisionAsNumber)
    const resultBN = numWei.mul(tokenPriceWithPrecision).div(precisionAsNumber);
    const asUSD = parseFloat(ethers.utils.formatUnits(resultBN, decimals));
    return asUSD;
  } catch (err) {
    return 0;
  }
}
export default CurrentSummary;
