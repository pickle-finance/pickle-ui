import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { IUserDillStats, UserData, UserTokenData } from "picklefinance-core/lib/client/UserModel";

import { RootState } from ".";
import { baseTokenObject, normalizedData } from "./user.helpers";

interface UserState {
  data: UserData | undefined;
  isFetching: boolean;
  updatedAt: number | undefined;
  nonce: number;
}

const initialState: UserState = {
  data: undefined,
  isFetching: true,
  updatedAt: undefined,
  // Incrementing this lets us refresh user data.
  nonce: 0,
};

type UpdateType = "incremental" | "final";

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<{ data: UserData; type: UpdateType }>) => {
      /**
       * Update state incrementally on initial page load. Only
       * update with the final user model on consequent runs to
       * avoid UI from going from populated to empty and back.
       */
      if (action.payload.type === "incremental") {
        if (state.updatedAt) return;

        state.data = normalizedData(action.payload.data);
      } else if (action.payload.type === "final") {
        /**
         * If the user model was updated in the last 30 seconds, it's because of partial
         * token refreshes due to user activity (by itself, it will update every N minutes).
         * This is to avoid a race condition where we update current state with stale
         * on-chain data from a full background refresh (a long-running process).
         */
        if (dayjs(state.updatedAt).isBefore(dayjs().subtract(30, "seconds"))) {
          state.data = normalizedData(action.payload.data);
        }

        state.updatedAt = +new Date();
      }
    },
    /**
     * This action allows us to merge in partial user token data. A good example of this
     * is when we perform a minimal user model refresh only for the active chain. This approach
     * protects us against losing state that doesn't exist on the current chain, e.g.
     * PICKLE balances.
     */
    setTokens: (state, action: PayloadAction<UserData>) => {
      if (!state.data) return;

      state.data.tokens = { ...state.data.tokens, ...action.payload.tokens };
      state.updatedAt = +new Date();
    },
    setTokenData: (
      state,
      action: PayloadAction<{ apiKey: string; data: Partial<UserTokenData> }>,
    ) => {
      if (!state.data) return;

      const { apiKey, data } = action.payload;
      const token = state.data.tokens[apiKey.toLowerCase()] || baseTokenObject;

      state.data.tokens = { ...state.data.tokens, [apiKey.toLowerCase()]: { ...token, ...data } };
    },
    setDillData: (state, action: PayloadAction<Partial<IUserDillStats>>) => {
      if (!state.data) return;

      const dill = state.data.dill;

      state.data.dill = { ...dill, ...action.payload };
    },
    setIsFetching: (state, action: PayloadAction<boolean>) => {
      state.isFetching = action.payload;
    },
    refresh: (state) => {
      state.nonce = state.nonce + 1;
    },
  },
});

const { refresh, setData, setIsFetching, setDillData, setTokenData, setTokens } = userSlice.actions;
export const UserActions = {
  refresh,
  setData,
  setDillData,
  setIsFetching,
  setTokens,
  setTokenData,
};

/**
 * Selectors
 */
const selectData = (state: RootState) => state.user.data;
const selectIsFetching = (state: RootState) => state.user.isFetching;
const selectNonce = (state: RootState) => state.user.nonce;
const selectTokenDataById = (state: RootState, apiKey: string) =>
  state.user.data?.tokens[apiKey.toLowerCase()];
const selectUpdatedAt = (state: RootState) => state.user.updatedAt;

export const UserSelectors = {
  selectData,
  selectIsFetching,
  selectNonce,
  selectTokenDataById,
  selectUpdatedAt,
};

export default userSlice.reducer;
