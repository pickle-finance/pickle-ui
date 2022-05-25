import { BigNumber } from "ethers";
import { useState } from "react";
import { Contracts } from "../containers/Contracts";

export enum TransactionStatus {
  Pending,
  Confirmed,
}

export const useGaugeProxy = () => {
  const { gaugeProxy } = Contracts.useContainer();
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.Confirmed);

  const vote = async (tokens: string[], weights: number[]) => {
    if (!gaugeProxy) return;

    setStatus(TransactionStatus.Pending);
    try {
      await gaugeProxy.vote(
        tokens,
        weights.map((weight) => BigNumber.from((weight * 100).toFixed(0))),
      );
    } catch (e) {
      console.error(e);
    }
    setStatus(TransactionStatus.Confirmed);
  };

  return { status, vote };
};
