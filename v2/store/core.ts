import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { QueryStatus } from "@reduxjs/toolkit/query";
import {
  AssetEnablement,
  PickleModelJson,
} from "picklefinance-core/lib/model/PickleModelJson";

import { RootState } from ".";

const apiHost = process.env.apiHost;

export const fetchCore = createAsyncThunk<PickleModelJson>(
  "core/fetch",
  async () => {
    const response = await fetch(`${apiHost}/protocol/pfcore`);
    return await response.json();
  },
);

interface CoreState {
  data: PickleModelJson | undefined;
  loading: keyof typeof QueryStatus;
}

const initialState: CoreState = { data: undefined, loading: "uninitialized" };

const coreSlice = createSlice({
  name: "core",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCore.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(fetchCore.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = "fulfilled";
    });
  },
});

/**
 * Selectors
 */
const selectEnabledJars = (state: RootState) => {
  if (state.core.data === undefined) return [];

  return state.core.data.assets.jars.filter(
    (jar) => jar.enablement === AssetEnablement.ENABLED,
  );
};

const selectLoadingState = (state: RootState) => state.core.loading;

export const CoreSelectors = {
  selectEnabledJars,
  selectLoadingState,
};

export default coreSlice.reducer;
