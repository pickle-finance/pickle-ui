import { OrderKind, CowSdk, OrderMetaData } from "@cowprotocol/cow-sdk";

import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { DELAY_FOR_QOUTE } from "./constants";
import { convertMintoMicroSec } from "./utils";

interface OrderParam {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  kind: OrderKind;
}

type QuoteParam = Pick<OrderParam, "sellToken" | "buyToken" | "kind"> & {
  amount: string;
  deadLine: number;
};

export const useCowSwap = () => {
  const [cowSwapSDK, setCowSwapSDK] = useState<CowSdk<number>>();
  const { chainId, library, account } = useWeb3React();
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      if (!chainId || !library) throw new Error("Metamask is not connected");
      setCowSwapSDK(new CowSdk(chainId, { signer: library.getSigner() }));
      setError("");
    } catch (err: any) {
      setError(err?.message ?? "Error occurred while initialising the cowswap");
    }
  }, [chainId]);

  const getQoute = async ({ sellToken, buyToken, amount, kind, deadLine }: QuoteParam) => {
    const quoteResponse = await cowSwapSDK?.cowApi.getQuote({
      kind, // Sell order (could also be BUY)
      sellToken,
      buyToken,
      amount,
      userAddress: account,
      validTo: ~~(Date.now() / 1000) + convertMintoMicroSec(deadLine),
    });
    return quoteResponse.quote;
  };

  const sendSwap = async ({
    sellAmount,
    buyAmount,
    buyToken,
    sellToken,
    kind,
    feeAmount,
    validTo,
  }: OrderParam & {
    feeAmount: string;
    validTo: number;
  }): Promise<string | undefined> => {
    if (!account) throw new Error("MetaMask is not connected");
    const order = {
      sellToken,
      buyToken,
      sellAmount,
      buyAmount,
      kind,
      receiver: account,
      partiallyFillable: false, // Allow partial executions of an order (true would be for a "Fill or Kill" order, which is not yet supported but will be added soon)
      validTo,
      feeAmount,
    };
    const signedOrder = await cowSwapSDK?.signOrder(order);
    if (!signedOrder) throw new Error("Unable to sign the order");
    const orderId = await cowSwapSDK?.cowApi.sendOrder({
      order: { ...order, ...signedOrder },
      owner: account,
    });
    return orderId;
  };

  const getOrder = async (orderId: string) => {
    return cowSwapSDK?.cowApi.getOrder(orderId);
  };

  return {
    getQoute,
    sendSwap,
    error,
    getOrder,
  };
};
