import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import { Contract as MulticallContract } from "ethers-multicall";
import dayjs from "v1/util/dayjs";

import { Connection } from "../Connection";
import { Contracts } from "../Contracts";
import { Prices } from "../Prices";
import { Dill } from "../Dill";
import { fetchHistoricalPriceSeries } from "./fetchHistoricalPriceSeries";

export const week = 7 * 24 * 60 * 60;
const firstMeaningfulDistributionTimestamp = 1619049600;

export type FeeDistributionDataPoint = {
  weeklyPickleAmount: number;
  totalPickleAmount: number;
  weeklyDillAmount: number;
  totalDillAmount: number;
  pickleDillRatio: number;
  isProjected: boolean;
  picklePriceUsd: number;
  distributionTime: Date;
};

export function useFeeDistributionSeries() {
  const { multicallProvider } = Connection.useContainer();
  const { feeDistributor } = Contracts.useContainer();
  const [feeDistributionSeries, setFeeDistributionSeries] = useState<FeeDistributionDataPoint[]>(
    [],
  );
  const { prices } = Prices.useContainer();
  const { weeklyDistribution: weeklyDistributionUsd } = Dill.useContainer();

  const fetchFeeDistributionSeries = async () => {
    if (multicallProvider && feeDistributor && prices && weeklyDistributionUsd) {
      const contract = new MulticallContract(feeDistributor.address, [
        ...feeDistributor.interface.fragments,
      ]);

      // Ignore initial negligible distributions that distort
      // PICKLE/DILL ratio range.
      const startTime = ethers.BigNumber.from(firstMeaningfulDistributionTimestamp);
      const [endTime] = await multicallProvider.all<BigNumber[]>([contract.time_cursor()]);

      let payoutTimes: BigNumber[] = [];
      for (let time = startTime; time.lt(endTime); time = time.add(ethers.BigNumber.from(week))) {
        payoutTimes.push(time);
      }

      const payouts = await multicallProvider.all<BigNumber[]>(
        payoutTimes.map((time) => contract.tokens_per_week(time)),
      );

      const dillAmounts = await multicallProvider.all<BigNumber[]>(
        payoutTimes.map((time) => contract.ve_supply(time)),
      );

      const picklePriceSeries = await fetchHistoricalPriceSeries({
        from: new Date(firstMeaningfulDistributionTimestamp * 1000),
      });

      let totalPickleAmount = 0;
      let lastTotalDillAmount = 0;

      setFeeDistributionSeries(
        payoutTimes.map((time, index) => {
          // Fees get distributed at the beginning of the following period.
          const distributionTime = new Date((time.toNumber() + week) * 1000);
          const isProjected = distributionTime > new Date();

          const weeklyPickleAmount = isProjected
            ? weeklyDistributionUsd / prices.pickle
            : parseFloat(ethers.utils.formatEther(payouts[index]));

          const historicalEntry = picklePriceSeries.find((value) =>
            dayjs(value[0]).isSameOrAfter(distributionTime, "day"),
          );
          const picklePriceUsd = historicalEntry ? historicalEntry[1] : prices.pickle;

          const totalDillAmount = parseInt(ethers.utils.formatEther(dillAmounts[index]));
          const pickleDillRatio = weeklyPickleAmount / totalDillAmount;

          totalPickleAmount += weeklyPickleAmount;

          const weeklyDillAmount = totalDillAmount - lastTotalDillAmount;
          lastTotalDillAmount = totalDillAmount;

          return {
            weeklyPickleAmount,
            totalPickleAmount,
            weeklyDillAmount,
            totalDillAmount,
            pickleDillRatio,
            picklePriceUsd,
            isProjected,
            distributionTime,
          };
        }),
      );
    }
  };

  useEffect(() => {
    fetchFeeDistributionSeries();
  }, [multicallProvider, feeDistributor?.address, prices?.pickle, weeklyDistributionUsd]);

  return {
    feeDistributionSeries,
  };
}
