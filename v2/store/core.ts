import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { maxBy } from "lodash";
import {
  AssetEnablement,
  PickleModelJson,
} from "picklefinance-core/lib/model/PickleModelJson";

import { RootState } from ".";
import { getNetworks } from "v2/features/connection/networks";
import { brandColor } from "v2/features/farms/colors";

const apiHost = process.env.apiHost;

export const fetchCore = createAsyncThunk<PickleModelJson>(
  "core/fetch",
  async () => {
    const response = await fetch(`${apiHost}/protocol/pfcore`);
    return await response.json();
  },
);

export interface Filter {
  type: "token" | "protocol" | "network";
  value: string;
  label: string;
  color: string;
  imageSrc: string;
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
    });
    builder.addCase(fetchCore.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = "fulfilled";
      state.filters = filtersFromCoreData(action.payload);
    });
  },
});

/**
 * Utilities
 */
const filtersFromCoreData = (data: PickleModelJson): Filter[] => {
  return data.chains.map(({ network, networkVisible }) => ({
    type: "network",
    value: network,
    label: networkVisible,
    imageSrc: `/networks/${network}.png`,
    color: brandColor(network),
  }));
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
const selectFilters = (state: RootState) => state.core.filters;
const selectLoadingState = (state: RootState) => state.core.loading;
const selectTimestamp = (state: RootState) => state.core.data?.timestamp;

export const CoreSelectors = {
  selectCore,
  selectEnabledJars,
  selectFilters,
  selectLoadingState,
  selectMaxApy,
  selectNetworks,
  selectTimestamp,
};

export default coreSlice.reducer;
