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
        [prev.name]: { token: prev },
      };
    } else {
      if (!acc[prev.chainId][prev.name]) {
        acc[prev.chainId][prev.name] = { token: prev };
      }
    }
    return acc;
  }, {});
};
