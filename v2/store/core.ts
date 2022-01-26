import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { maxBy } from "lodash";
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
const selectCore = (state: RootState) => state.core.data;
const selectEnabledJars = (state: RootState) => {
  if (state.core.data === undefined) return [];

  return state.core.data.assets.jars.filter(
    (jar) => jar.enablement === AssetEnablement.ENABLED,
  );
};
const selectMaxApy = (state: RootState) => {
  if (state.core.data === undefined) return undefined;

  const jars = state.core.data.assets.jars;
  const data = jars
    .filter((jar) => jar.enablement === AssetEnablement.ENABLED)
    .map((jar) => {
      let farmApr = 0;
      const apy = jar.aprStats?.apy || 0;
      const farmApyComponents = jar.farm?.details?.farmApyComponents;

      if (farmApyComponents && farmApyComponents.length) {
        farmApr = farmApyComponents[0].apr;
      }

      return {
        apiKey: jar.details.apiKey,
        name: jar.depositToken.name,
        chain: state.core.data?.chains.find(x=>x.network === jar.chain)?.networkVisible || "Ethereum",
        apy: apy + farmApr,
      };
    })
    .filter((jar) => jar.apiKey)
    // When we add a new chain this value will be null and break SSG
    .filter((jar) => jar.chain);

  return maxBy(data, "apy")!;
}

const selectLoadingState = (state: RootState) => state.core.loading;
const selectTimestamp = (state: RootState) => state.core.data?.timestamp;

export const CoreSelectors = {
  selectCore,
  selectEnabledJars,
  selectLoadingState,
  selectTimestamp,
  selectMaxApy
};

export default coreSlice.reducer;
