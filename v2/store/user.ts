import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { PickleModelJson } from "picklefinance-core/lib/model/PickleModelJson";
import { UserModel, UserData } from "picklefinance-core/lib/client/UserModel"

import { RootState } from ".";

const apiHost = process.env.apiHost;

export const fetchUserData = createAsyncThunk<UserData>(
  "user/fetch",
  async () => {
    // This is a second request to core, but, if you know how to 
    // depend on the existing one, great. 
    console.log("Testing 0");
    const response = await fetch(`${apiHost}/protocol/pfcore`);
    const core2: PickleModelJson = await response.json();

    console.log("Testing 1");
    // TODO we need to get the wallet id, let's hard-code one for now
    const user : UserModel = new UserModel(core2, "0xTest", new Map());
    console.log("Testing 2");
    const r = await user.generateUserModel();
    console.log("Testing 3");
    return r;
  },
);

interface UserState {
  data: UserData | undefined;
  loading: keyof typeof QueryStatus;
}

const initialState: UserState = { data: undefined, loading: "uninitialized" };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserData.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(fetchUserData.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = "fulfilled";
    });
  },
});

const selectLoadingState = (state: RootState) => state.user.loading;

/**
 * Selectors
 */
 const selectUserData = (state: RootState) => {
   console.log("Inside selectUserData");
  return state.user.data;
};

export const UserModelSelectors = {
  selectLoadingState,
  selectUserData
};

export default userSlice.reducer;
