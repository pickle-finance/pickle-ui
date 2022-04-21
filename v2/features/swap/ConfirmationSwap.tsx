import { OrderKind } from "@cowprotocol/cow-sdk";
import React, { FC } from "react";
import { ReadCurrencyInput } from "./ReadCurrencyInput";
import { SwapInfo } from "./SwapInfo";
import { SwapSelect } from "./SwapSelector";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { GPv2VaultRelayerAddress } from "./constants";
import BigNumber from "bignumber.js";
import { useCowSwap } from "./useCowSwap";
import ConfirmationFlow from "./flow/ConfirmationFlow";
import { calculatePercentage } from "./utils";
import { ErrorMessage } from "./ErrorMessage";

interface ConfirmationSwapProps {
  token1: SwapSelect | undefined;
  token2: SwapSelect | undefined;
  setOpenConfirmationalModel: (val: boolean) => void;
  getFee: (data: any) => string;
  kind: OrderKind;
  confirmationalSwap: any;
  costOfOneTokenWRTOtherToken: (val?: boolean) => string;
  slippageTolerance: number;
}

export const ConfirmationSwap: FC<ConfirmationSwapProps> = ({
  token1,
  token2,
  setOpenConfirmationalModel,
  getFee,
  kind,
  confirmationalSwap,
  costOfOneTokenWRTOtherToken,
  slippageTolerance,
}) => {
  const { chainId, account } = useWeb3React<Web3Provider>();

  const { sendSwap, error, getOrder } = useCowSwap();
  if (!token1 || !token2) return <div />;

  const finalSubmit = async (): Promise<string | undefined> => {
    if (!account || !chainId) throw new Error("MetaMask is not connected");
    if (!token1 || !token2) throw new Error("Please fill the swap details");
    if (!GPv2VaultRelayerAddress[chainId])
      throw new Error("Chain Id is not supported for the swap");
    // TODO: need to look into it
    // if (confirmationalSwap?.validTo > ~~(Date.now() / 1000)) {
    //   throw new Error("Order is expired");
    // }
    let adjustedSlippageBuyAmount = confirmationalSwap?.buyAmount;
    let adjustedSlippageSellAmount = confirmationalSwap?.sellAmount;
    if (!adjustedSlippageBuyAmount || !adjustedSlippageSellAmount)
      throw new Error("Buy/Sell amount is zero");
    const percentageSlippage = calculatePercentage(slippageTolerance);
    if (OrderKind.SELL === confirmationalSwap.kind) {
      adjustedSlippageBuyAmount = new BigNumber(1 - percentageSlippage)
        .times(adjustedSlippageBuyAmount)
        .integerValue(BigNumber.ROUND_DOWN)
        .toString();
    } else {
      adjustedSlippageSellAmount = new BigNumber(1 + percentageSlippage)
        .times(adjustedSlippageSellAmount)
        .integerValue(BigNumber.ROUND_DOWN)
        .toString();
    }
    return sendSwap({
      buyAmount: adjustedSlippageBuyAmount,
      buyToken: token2.value.address,
      feeAmount: confirmationalSwap?.feeAmount,
      sellAmount: adjustedSlippageSellAmount,
      sellToken: token1.value.address,
      kind,
      validTo: confirmationalSwap?.validTo ?? ~~(Date.now() / 1000),
    });
  };
  const pendingTrx = async (orderId: string) => {
    const data = await getOrder(orderId);
    return data?.status;
  };

  return (
    <div>
      <button onClick={() => setOpenConfirmationalModel(false)}>Back</button>
      <div className="my-4">
        <ReadCurrencyInput tokenA={token1} amount={confirmationalSwap.amount1} />
        <div className="py-4" />
        <ReadCurrencyInput tokenA={token2} amount={confirmationalSwap.amount2} />
      </div>
      <SwapInfo
        isEligibleQoute
        costOfOneTokenWRTOtherToken={costOfOneTokenWRTOtherToken}
        qoute={{ data: confirmationalSwap }}
        token1={token1}
        token2={token2}
        getFee={() => getFee(confirmationalSwap)}
        kind={kind}
      />
      <ErrorMessage error={error} />
      <ConfirmationFlow mainFunc={finalSubmit} pendingFunc={pendingTrx} />
    </div>
  );
};
