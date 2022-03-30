import { cloneDeep } from "lodash";
import { UserData, UserTokenData } from "picklefinance-core/lib/client/UserModel";

import { UserDataV2 } from "./user";

export interface TokensById {
  [key: string]: Partial<UserTokenData> | undefined;
}

export const baseTokenObject: Partial<UserTokenData> = {
  depositTokenBalance: "0",
  pAssetBalance: "0",
  pStakedBalance: "0",
  picklePending: "0",
  jarAllowance: "0",
  farmAllowance: "0",
};

export const normalizeUserTokens = (data: UserData): TokensById => {
  const { tokens } = data;
  let result: TokensById = {};
  const tokenNames = Object.keys(tokens);
  for (let i = 0; i < tokenNames.length; i++) {
    result[tokens[tokenNames[i]].assetKey] = tokens[tokenNames[i]]
  }

  return result;
};


/**
 * A deep clone is important because if we dispatch data
 * passed to user model callbacks, Redux will make it
 * read-only, thus breaking the internals of UserModel.
 *
 */
export const normalizedData = (data: UserData): UserData => ({
  ...cloneDeep(data),
});
