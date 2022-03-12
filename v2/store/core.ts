import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { maxBy, orderBy } from "lodash";
import {
  AssetEnablement,
  ExternalAssetDefinition,
  JarDefinition,
  PickleModelJson,
  StandaloneFarmDefinition,
} from "picklefinance-core/lib/model/PickleModelJson";

import { RootState } from ".";
import { Filter, FilterType, ControlsSelectors, SortType } from "./controls";
import { getNetworks } from "v2/features/connection/networks";
import { brandColor } from "v2/features/farms/colors";
import {
  getUserAssetDataWithPrices,
  UserAssetDataWithPrices,
} from "v2/features/farms/FarmsTableRowHeader";
import { UserSelectors } from "./user";

const apiHost = process.env.apiHost;

export const fetchCore = createAsyncThunk<PickleModelJson>("core/fetch", async () => {
  const response = await fetch(`${apiHost}/protocol/pfcore`);
  return await response.json();
});

type Asset = JarDefinition | StandaloneFarmDefinition | ExternalAssetDefinition;

export interface JarWithData extends JarDefinition, UserAssetDataWithPrices {
  [SortType.Earned]: number | undefined;
  [SortType.Deposited]: number | undefined;
  [SortType.Apy]: number | undefined;
  [SortType.Liquidity]: number | undefined;
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

/**
 * We sort filters in the following order:
 * Networks -> Protocols -> Tokens (alphabetical sort withing groups)
 * This is the order they appear in the filters autocomplete menu.
 */
const filtersFromCoreData = (data: PickleModelJson): Filter[] => {
  let protocols: string[] = [];
  let tokens: string[] = [];

  const processJar = (jar: Asset): void => {
    if (jar.enablement !== AssetEnablement.ENABLED) return;

    protocols.push(jar.protocol);

    const { components } = jar.depositToken;

    if (!components) return;

    tokens.push(...components);
  };

  const entities = ["jars", "external", "standaloneFarms"] as const;
  entities.forEach((entity) => data.assets[entity].forEach(processJar));

  const networkFilters = data.chains.map(({ network, networkVisible }) => ({
    type: FilterType.Network,
    value: network,
    label: networkVisible,
    imageSrc: `/networks/${network}.png`,
    color: brandColor(network),
  }));

  const uniqueProtocols = [...new Set(protocols)];
  const protocolFilters = uniqueProtocols.sort().map((protocol) => {
    const sanitizedProtocolName = protocol.replace(/\s|\./g, "").toLowerCase();

    return {
      type: FilterType.Protocol,
      value: protocol,
      label: protocol,
      imageSrc: `/protocols/${sanitizedProtocolName}.png`,
      color: brandColor(sanitizedProtocolName),
    };
  });

  const uniqueTokens = [...new Set(tokens)];
  const tokenFilters = uniqueTokens.sort().map((token) => ({
    type: FilterType.Token,
    value: token,
    label: token.toUpperCase(),
    imageSrc: `/tokens/${token}.png`,
    color: brandColor(token),
  }));

  return [...networkFilters, ...protocolFilters, ...tokenFilters];
};

/**
 * Selectors
 */
const selectCore = (state: RootState) => state.core.data;
const selectEnabledJars = (state: RootState) => {
  const { data } = state.core;

  if (data === undefined) return [];

  return data.assets.jars.filter((jar) => jar.enablement === AssetEnablement.ENABLED);
};

const selectFilteredAssets = createSelector(
  selectEnabledJars,
  ControlsSelectors.selectFilters,
  ControlsSelectors.selectMatchAllFilters,
  (jars, filters, matchAllFilters) => {
    if (filters.length === 0) return jars;

    return jars.filter((jar) => {
      const predicateResults = filters.map((filter) => {
        switch (filter.type) {
          case FilterType.Network:
            return jar.chain === filter.value;
          case FilterType.Protocol:
            return jar.protocol === filter.value;
          case FilterType.Token:
            const { components } = jar.depositToken;

            if (!components) return false;

            return components.includes(filter.value);
          default:
            return false;
        }
      });

      const matchingFilters = predicateResults.filter(Boolean);

      return matchAllFilters
        ? matchingFilters.length === predicateResults.length
        : matchingFilters.length > 0;
    });
  },
);

/**
 * This allows us to use the same selector on Farms page where we want filtered, paginated
 * results, and on the dashboard page where we want all joined farms.
 */
interface MakeJarsSelectorOpts {
  filtered?: boolean;
  paginated?: boolean;
}

const makeJarsSelector = (options: MakeJarsSelectorOpts = {}) => {
  const selectJarsFunction = options.filtered ? selectFilteredAssets : selectEnabledJars;

  return createSelector(
    selectJarsFunction,
    selectCore,
    ControlsSelectors.selectPaginateParams,
    ControlsSelectors.selectSort,
    UserSelectors.selectData,
    (jars, allCore, pagination, sort, userModel) => {
      // Sort first, and then compute pagination
      let jarsWithData: JarWithData[] = jars.map((jar) => {
        const data = getUserAssetDataWithPrices(jar, allCore, userModel);
        const deposited = data.depositTokensInJar.tokensUSD + data.depositTokensInFarm.tokensUSD;
        const earned = data.earnedPickles.tokensUSD || 0;
        const apy = jar.aprStats?.apy || 0;
        const liquidity = jar.details.harvestStats?.balanceUSD || 0;
        return {
          ...jar,
          ...data,
          deposited,
          earned,
          apy,
          liquidity,
        };
      });

      if (sort && sort.type != SortType.None) {
        jarsWithData = orderBy(jarsWithData, [sort.type], [sort.direction]);
      }

      if (options.paginated) {
        const { offset, itemsPerPage } = pagination;
        const endOffset = offset + itemsPerPage;
        return jarsWithData.slice(offset, endOffset);
      }

      return jarsWithData;
    },
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
        chain: data.chains.find((chain) => chain.network === jar.chain)!.networkVisible,
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
const selectPicklePrice = (state: RootState): number => {
  const prices = selectPrices(state);

  return prices ? prices["pickle"] : 0;
};
const selectPrices = (state: RootState) => state.core.data?.prices;
const selectTimestamp = (state: RootState) => state.core.data?.timestamp;

export const CoreSelectors = {
  makeJarsSelector,
  selectCore,
  selectEnabledJars,
  selectFilteredAssets,
  selectFilters,
  selectLoadingState,
  selectMaxApy,
  selectNetworks,
  selectPicklePrice,
  selectTimestamp,
};

export default coreSlice.reducer;
