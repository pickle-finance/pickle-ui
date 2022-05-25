import { Overrides } from "ethers";

export enum JarInteraction {
  Deposit = "JarDeposit",
  Withdraw = "JarWithdraw",
  WithdrawAll = "JarWithdrawAll",
}

export enum GaugeInteraction {
  DepositAll = "GaugeDepositAll",
  GetReward = "GaugeGetReward",
  Withdraw = "GaugeWithdraw",
  Exit = "GaugeExit",
}

type Interaction = JarInteraction | GaugeInteraction;

interface TokenGasLimits {
  [tokenAddress: string]: {
    [key in Interaction]?: number;
  };
}

const tokenGasLimits: TokenGasLimits = {
  // LOOKS
  "0xb4EBc2C371182DeEa04B2264B9ff5AC4F0159C69": {
    [JarInteraction.Withdraw]: 300000,
    [JarInteraction.WithdrawAll]: 300000,
  },
};

export const gasLimit = (tokenAddress: string, interaction: Interaction): Overrides => {
  const gasLimit = tokenGasLimits?.[tokenAddress]?.[interaction];

  return gasLimit ? { gasLimit } : {};
};
