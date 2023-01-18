import { useEffect, useMemo, useState } from "react";

import { useWeb3React } from "@web3-react/core";
import { quote, getSupportedTokens, Token } from "wido";
import { BigNumber, ContractTransaction } from "ethers";

export const WIDO_ROUTER = "0x7Fb69e8fb1525ceEc03783FFd8a317bafbDfD394";
export const WIDO_TOKEN_MANAGER = "0xF2F02200aEd0028fbB9F183420D3fE6dFd2d3EcD";
const MAINNET_CHAIN_ID = 1;
const ALLOWABLE_SLIPPAGE = 0.3;
const PICKLE_PROTOCOL_KEY = "pickle.finance";

interface SwapProps {
  fromToken: string;
  toToken: string;
  amount: BigNumber;
}

export const useWido = () => {
  const { library, account } = useWeb3React();
  const signer = library.getSigner();

  const swapWido = async ({
    fromToken,
    toToken,
    amount,
  }: SwapProps): Promise<ContractTransaction> => {
    console.log(amount);
    const quoteResult = await quote({
      fromChainId: MAINNET_CHAIN_ID, // Chain Id of from token
      fromToken, // Token address of from token
      toChainId: MAINNET_CHAIN_ID, // Chain Id of to token
      toToken, // Token address of to token
      amount: amount.toString(), // Token amount of from token
      slippagePercentage: ALLOWABLE_SLIPPAGE, // Acceptable max slippage for the swap
      user: account!, // Address of user placing the order.
    });

    return signer.sendTransaction({ data: quoteResult.data, to: WIDO_ROUTER, gasLimit: 1_000_000 });
  };

  const config = {
    key: "@session",
  };
  const supportedTokensStored = sessionStorage.getItem(config.key);
  const parsedSupportedTokens = supportedTokensStored && JSON.parse(supportedTokensStored);

  const [supportedTokens, setSupportedTokens] = useState<Array<Token>>(parsedSupportedTokens || []);

  useEffect(() => {
    const getSupportedTokensFromWido = async () => {
      if (!supportedTokensStored?.length) {
        const supportedTokensRes = await getSupportedTokens({
          chainId: [MAINNET_CHAIN_ID],
          protocol: [PICKLE_PROTOCOL_KEY],
        });
        setSupportedTokens(supportedTokensRes);
        sessionStorage.setItem(config.key, JSON.stringify(supportedTokensRes));
      }
    };
    getSupportedTokensFromWido();
  }, [config.key]);

  return {
    supportedTokens,
    swapWido,
  };
};

export const useWidoSupportedTokens = () => {};
