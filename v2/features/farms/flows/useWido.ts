import { useEffect, useMemo, useState } from "react";

import { useWeb3React } from "@web3-react/core";
import { quote, getSupportedTokens, Token, getBalances } from "wido";
import { BigNumber, ContractTransaction } from "ethers";

export const WIDO_ROUTER = "0x7Fb69e8fb1525ceEc03783FFd8a317bafbDfD394";

export const FEE_SHARING = "0xaCfE4511CE883C14c4eA40563F176C3C09b4c47C";

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
    const quoteResult = await quote({
      fromChainId: MAINNET_CHAIN_ID, // Chain Id of from token
      fromToken, // Token address of from token
      toChainId: MAINNET_CHAIN_ID, // Chain Id of to token
      toToken, // Token address of to token
      amount: amount.toString(), // Token amount of from token
      slippagePercentage: ALLOWABLE_SLIPPAGE, // Acceptable max slippage for the swap
      user: account!, // Address of user placing the order.
      partner: FEE_SHARING, // Address of partner referring the user.
    });

    return signer.sendTransaction({
      value: quoteResult.value,
      data: quoteResult.data,
      to: quoteResult.to || WIDO_ROUTER,
    });
  };

  const getWidoSpenderAddress = useMemo(() => {}, []);

  const config = {
    jars: "@jars",
    tokens: "@tokens",
  };

  const [supportedJars, setSupportedJars] = useState<Array<Token>>([]);

  const [supportedTokens, setSupportedTokens] = useState<Array<Token>>([]);

  const [supportedTokensWithBalance, setSupportedTokensWithBalance] = useState<Array<Token>>([]);

  useEffect(() => {
    const getSupportedJarsFromWido = async () => {
      const supportedJarsStored = sessionStorage.getItem(config.jars);
    
      if (!supportedJarsStored?.length) {
        const supportedJarsRes = await getSupportedTokens({
          chainId: [MAINNET_CHAIN_ID],
          protocol: [PICKLE_PROTOCOL_KEY],
        });
        setSupportedJars(supportedJarsRes);
        sessionStorage.setItem(config.jars, JSON.stringify(supportedJarsRes));
      }
    };

    const getSupportedTokensFromWido = async () => {
      const supportedTokensStored = sessionStorage.getItem(config.tokens);

      if (!supportedTokensStored?.length) {
        const supportedTokensRes = await getSupportedTokens({
          chainId: [1], // (Optional) Array of chain ids to filter by
        });

        setSupportedTokens(supportedTokensRes);
        sessionStorage.setItem(config.tokens, JSON.stringify(supportedTokensRes));
      }
    };

    const getTokensWithUserBalance = async () => {
      if (supportedTokens.length == 0 || !account) return;
      const balances = await getBalances(account, [1]);
      const supportedTokensWithBalance = supportedTokens.filter((token) =>
        balances.find((balance) => balance.address == token.address),
      );

      setSupportedTokensWithBalance(supportedTokensWithBalance);
    };

    getSupportedJarsFromWido();
    getSupportedTokensFromWido();
    getTokensWithUserBalance();
  }, [config.jars, config.tokens, account, supportedTokens]);

  return {
    supportedTokensWithBalance,
    supportedTokens,
    supportedJars,
    swapWido,
  };
};

export const useWidoSupportedTokens = () => {};
