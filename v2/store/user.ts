import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { BigNumber } from "ethers";
import { ChainNetwork } from "picklefinance-core";
import {
  IUserDillStats,
  UserData,
  UserTokenData,
  UserBrineryData,
} from "picklefinance-core/lib/client/UserModel";

import { RootState } from ".";
import {
  baseTokenObject,
  deepMergeIncrementalUserDataUpdate,
  normalizedData,
} from "./user.helpers";

interface AccountData {
  data: UserData;
  updatedAt: number | undefined;
}

interface UserState {
  accounts: {
    [address: string]: AccountData | undefined;
  };
  nonce: number;
  isFetching: boolean;
}

const initialState: UserState = {
  accounts: {},
  nonce: 0,
  isFetching: true,
};

type UpdateType = "incremental" | "final";

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setData: (
      state,
      action: PayloadAction<{ account: string; data: UserData; type: UpdateType }>,
    ) => {
      const { account, data, type } = action.payload;
      const accountData = state.accounts[account] || ({} as AccountData);

      if (type === "incremental") {
        /**
         * If the timestamp is present, it means we have a full, persisted user model in which
         * case we have to do a deep merge of incremental data. Otherwise we're in the first
         * user model run for this account and we can set data directly.
         */
        if (accountData.updatedAt) {
          accountData.data = deepMergeIncrementalUserDataUpdate(
            accountData.data,
            normalizedData(data),
          );
        } else {
          accountData.data = normalizedData(data);
        }
      } else if (type === "final") {
        /**
         * If the user model was updated in the last 30 seconds, it's because of partial
         * token refreshes due to user activity (by itself, it will update every N minutes).
         * This is to avoid a race condition where we update current state with stale
         * on-chain data from a full background refresh (a long-running process).
         */
        if (dayjs(accountData.updatedAt).isBefore(dayjs().subtract(30, "seconds"))) {
          accountData.data = normalizedData(data);
        }

        accountData.updatedAt = +new Date();
      }

      state.accounts[account] = accountData;
    },
    /**
     * This action allows us to merge in partial user token data. A good example of this
     * is when we perform a minimal user model refresh only for the active chain. This approach
     * protects us against losing state that doesn't exist on the current chain, e.g.
     * PICKLE balances.
     */
    setTokens: (state, action: PayloadAction<{ account: string; data: UserData }>) => {
      const { account, data } = action.payload;
      const accountData = state.accounts[account];

      if (!accountData) return;

      accountData.data.tokens = { ...accountData.data.tokens, ...data.tokens };
      accountData.updatedAt = +new Date();

      state.accounts[account] = accountData;
    },
    setTokenData: (
      state,
      action: PayloadAction<{ account: string; apiKey: string; data: Partial<UserTokenData> }>,
    ) => {
      const { account, apiKey, data } = action.payload;
      const accountData = state.accounts[account];

      if (!accountData) return;

      const token = accountData.data.tokens[apiKey.toLowerCase()] || baseTokenObject;

      accountData.data.tokens = {
        ...accountData.data.tokens,
        [apiKey.toLowerCase()]: { ...token, ...data },
      };

      state.accounts[account] = accountData;
    },
    setDillData: (
      state,
      action: PayloadAction<{ account: string; data: Partial<IUserDillStats> }>,
    ) => {
      const { account, data } = action.payload;
      const accountData = state.accounts[account];

      if (!accountData) return;

      const { dill } = accountData.data;

      accountData.data.dill = { ...dill, ...data };

      state.accounts[account] = accountData;
    },

    setBrineryData: (
      state,
      action: PayloadAction<{ account: string; apiKey: string; data: Partial<UserBrineryData> }>,
    ) => {
      const { account, apiKey, data } = action.payload;
      const accountData = state.accounts[account];

      if (!accountData) return;

      accountData.data.brineries[apiKey.toLowerCase()] = {
        ...accountData.data.brineries[apiKey.toLowerCase()],
        ...data,
      };

      state.accounts[account] = accountData;
    },

    addHarvestedPickles: (
      state,
      action: PayloadAction<{ account: string; chain: ChainNetwork; amount: string }>,
    ) => {
      const { account, chain, amount } = action.payload;
      const accountData = state.accounts[account];

      if (!accountData) return;

      const harvestedAmountBN = BigNumber.from(amount);
      const chainPicklesBN = BigNumber.from(accountData.data.pickles[chain]);

      accountData.data.pickles = {
        ...accountData.data.pickles,
        [chain]: chainPicklesBN.add(harvestedAmountBN).toString(),
      };

      state.accounts[account] = accountData;
    },
    setIsFetching: (state, action: PayloadAction<boolean>) => {
      state.isFetching = action.payload;
    },
    refresh: (state) => {
      state.nonce = state.nonce + 1;
    },
  },
});

const {
  addHarvestedPickles,
  refresh,
  setData,
  setIsFetching,
  setDillData,
  setTokenData,
  setTokens,
  setBrineryData,
} = userSlice.actions;
export const UserActions = {
  addHarvestedPickles,
  refresh,
  setData,
  setDillData,
  setIsFetching,
  setTokens,
  setTokenData,
  setBrineryData,
};

/**
 * Selectors
 */
const selectData = (state: RootState, account: string | null | undefined) => {
  if (!account) return;

  return state.user.accounts[account]?.data;
};
const selectIsFetching = (state: RootState) => state.user.isFetching;
const selectNonce = (state: RootState) => state.user.nonce;
const selectTokenDataById = (
  state: RootState,
  apiKey: string,
  account: string | null | undefined,
) => {
  if (!account) return;

  return state.user.accounts[account]?.data?.tokens[apiKey.toLowerCase()];
};
const selectBrineryDataById = (
  state: RootState,
  apiKey: string,
  account: string | null | undefined,
) => {
  if (!account) return;

  return state.user.accounts[account]?.data?.brineries[apiKey.toLowerCase()];
};
const selectUpdatedAt = (state: RootState, account: string | null | undefined) => {
  if (!account) return;

  return state.user.accounts[account]?.updatedAt;
};

export const UserSelectors = {
  selectData,
  selectIsFetching,
  selectNonce,
  selectTokenDataById,
  selectUpdatedAt,
  selectBrineryDataById,
};

export default userSlice.reducer;
