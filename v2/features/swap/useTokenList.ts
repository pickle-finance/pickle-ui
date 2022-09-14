import DEFAULT_TOKEN_LIST from "@uniswap/default-token-list";
import { TokenInfo } from "@uniswap/token-lists";

export type TokenAddressMap = {
  [chainId: number]: {
    [tokenName: string]: {
      token: TokenInfo;
    };
  };
};

export const getListOfTokens = () => {
  return DEFAULT_TOKEN_LIST.tokens.reduce<TokenAddressMap>((acc, prev) => {
    if (!acc[prev.chainId]) {
      acc[prev.chainId] = {
        [prev.symbol]: { token: prev },
      };
    } else {
      if (!acc[prev.chainId][prev.symbol]) {
        acc[prev.chainId][prev.symbol] = { token: prev };
      }
    }
    return acc;
  }, {});
};
