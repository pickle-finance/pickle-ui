import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserData } from "picklefinance-core/lib/client/UserModel";

import { RootState } from ".";

interface UserState {
  data: UserData | undefined;
}

const initialState: UserState = {
  data: undefined,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<UserData>) => {
      state.data = action.payload;
    },
  },
});

export const { setData } = userSlice.actions;

/**
 * Selectors
 */
const selectData = (state: RootState) => state.user.data;

export const UserSelectors = {
  selectData,
};

export default userSlice.reducer;
