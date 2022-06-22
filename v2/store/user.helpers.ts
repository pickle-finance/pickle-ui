import { cloneDeep } from "lodash";
import { UserData, UserTokenData } from "picklefinance-core/lib/client/UserModel";

export const baseTokenObject: Partial<UserTokenData> = {
  depositTokenBalance: "0",
  pAssetBalance: "0",
  pStakedBalance: "0",
  picklePending: "0",
  jarAllowance: "0",
  farmAllowance: "0",
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

export const deepMergeIncrementalUserDataUpdate = (
  currentData: UserData,
  newData: UserData,
): UserData => {
  const result = {
    ...currentData,
    brineries: {
      ...currentData.brineries,
      ...newData.brineries,
    },
    pickles: {
      ...currentData.pickles,
      ...newData.pickles,
    },
    tokens: {
      ...currentData.tokens,
      ...newData.tokens,
    },
  };

  /**
   * Dill balances return 0s until they load. Skip in that case
   * so that we don't override current balances.
   */
  if (newData.dill.balance !== "0") {
    result.dill = { ...result.dill, ...newData.dill };
  }

  return result;
};
