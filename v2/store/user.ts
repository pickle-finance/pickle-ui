import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserData } from "picklefinance-core/lib/client/UserModel";

import { RootState } from ".";

interface UserState {
  data: UserData | undefined;
  isFetching: boolean;
  updatedAt: number | undefined;
}

const initialState: UserState = {
  data: undefined,
  isFetching: true,
  updatedAt: undefined,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<UserData>) => {
      state.data = action.payload;
      state.updatedAt = +new Date();
    },
    setIsFetching: (state, action: PayloadAction<boolean>) => {
      state.isFetching = action.payload;
    },
  },
});

export const { setData, setIsFetching } = userSlice.actions;

/**
 * Selectors
 */
const selectData = (state: RootState) => state.user.data;
const selectIsFetching = (state: RootState) => state.user.isFetching;
const selectUpdatedAt = (state: RootState) => state.user.updatedAt;

export const UserSelectors = {
  selectData,
  selectIsFetching,
  selectUpdatedAt,
};

export default userSlice.reducer;
