import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { maxBy } from "lodash";
import {
  AssetEnablement,
  PickleModelJson,
} from "picklefinance-core/lib/model/PickleModelJson";
import { Chains } from "picklefinance-core/lib/chain/Chains";

import { RootState } from ".";
import { getNetworks } from "v2/features/connection/networks";

const apiHost = process.env.apiHost;

export const fetchCore = createAsyncThunk<PickleModelJson>(
  "core/fetch",
  async () => {
    const response = await fetch(`${apiHost}/protocol/pfcore`);
    return await response.json();
  },
);

interface Filter {
  value: string;
  label: string;
  color: string;
  imageSrc: string;
  type: "token" | "protocol" | "network";
}

interface CoreState {
  data: PickleModelJson | undefined;
  loading: keyof typeof QueryStatus;
  filters: Filter[];
}

const initialState: CoreState = {
  data: undefined,
  loading: "uninitialized",
  filters: [],
};

const coreSlice = createSlice({
  name: "core",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCore.pending, (state) => {
      state.loading = "pending";
      console.log(Chains.list());
    });
    builder.addCase(fetchCore.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = "fulfilled";
    });
  },
});

/**
 * Utilities
 */
const filtersFromCoreData = (data: PickleModelJson) => {
  const tokens: Set<string> = new Set();
  const networks: Set<string> = new Set();
  const protocols: Set<string> = new Set();
};

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
  const { data } = state.core;

  if (data === undefined) return undefined;

  const { jars } = data.assets;
  const entries = jars
    .filter((jar) => jar.enablement === AssetEnablement.ENABLED)
    .map((jar) => {
      let farmApr = 0;
      const apy = jar.aprStats?.apy || 0;
      const farmApyComponents = jar.farm?.details?.farmApyComponents;

      if (farmApyComponents?.length) {
        farmApr = farmApyComponents[0].apr;
      }

      return {
        name: jar.depositToken.name,
        chain: data.chains.find((chain) => chain.network === jar.chain)!
          .networkVisible,
        apy: apy + farmApr,
      };
    });

  return maxBy(entries, "apy")!;
};

const selectNetworks = (state: RootState) => {
  if (state.core.data === undefined) return [];

  return getNetworks(state.core.data);
};
const selectLoadingState = (state: RootState) => state.core.loading;
const selectTimestamp = (state: RootState) => state.core.data?.timestamp;

export const CoreSelectors = {
  selectCore,
  selectEnabledJars,
  selectLoadingState,
  selectTimestamp,
  selectMaxApy,
  selectNetworks,
};

export default coreSlice.reducer;
