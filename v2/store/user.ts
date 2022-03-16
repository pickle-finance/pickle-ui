import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
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

type UpdateType = "incremental" | "final";

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<{ data: UserData; type: UpdateType }>) => {
      /**
       * A deep clone is important because if we dispatch data
       * passed to user model callbacks, Redux will make it
       * read-only, thus breaking the internals of UserModel.
       *
       * Update state incrementally on initial page load. Only
       * update with the final user model on consequent runs to
       * avoid UI from going from populated to empty and back.
       */
      if (action.payload.type === "incremental") {
        if (state.updatedAt) return;

        state.data = cloneDeep(action.payload.data);
      } else if (action.payload.type === "final") {
        state.data = cloneDeep(action.payload.data);
        state.updatedAt = +new Date();
      }
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
