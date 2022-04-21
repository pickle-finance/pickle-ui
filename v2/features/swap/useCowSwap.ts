import { OrderKind, CowSdk } from "@cowprotocol/cow-sdk";

import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { DELAY_FOR_QOUTE } from "./constants";

interface OrderParam {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  kind: OrderKind;
}

type QuoteParam = Pick<OrderParam, "sellToken" | "buyToken" | "kind"> & { amount: string };

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

  const getQoute = async ({ sellToken, buyToken, amount, kind }: QuoteParam) => {
    const quoteResponse = await cowSwapSDK?.cowApi.getQuote({
      kind, // Sell order (could also be BUY)
      sellToken,
      buyToken,
      amount,
      userAddress: account,
      validTo: ~~(Date.now() / 1000) + DELAY_FOR_QOUTE,
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
  }: OrderParam & {
    feeAmount: string;
  }) => {
    if (!account) throw new Error("MetaMask is not connected");
    const order = {
      sellToken,
      buyToken,
      sellAmount,
      buyAmount,
      kind,
      receiver: account,
      partiallyFillable: false, // Allow partial executions of an order (true would be for a "Fill or Kill" order, which is not yet supported but will be added soon)
      validTo: ~~(Date.now() / 1000) + DELAY_FOR_QOUTE,
      feeAmount,
    };
    const signedOrder = await cowSwapSDK?.signOrder(order);
    if (!signedOrder) throw new Error("Unable to sign the order");
    const orderId = await cowSwapSDK?.cowApi.sendOrder({
      order: { ...order, ...signedOrder },
      owner: account,
    });

    // We can inspect the Order details in the CoW Protocol Explorer
    console.log(`https://explorer.cow.fi/rinkeby/orders/${orderId}`);
    return orderId;
  };

  return {
    getQoute,
    sendSwap,
    error,
  };
};
