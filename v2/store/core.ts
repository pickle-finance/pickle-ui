import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { maxBy, orderBy } from "lodash";
import {
  AssetEnablement,
  AssetProtocol,
  JarDefinition,
  PickleModelJson,
} from "picklefinance-core/lib/model/PickleModelJson";

import { RootState } from ".";
import { Filter, FilterType, ControlsSelectors, SortType } from "./controls";
import { getNetworks } from "v2/features/connection/networks";
import { brandColor } from "v2/features/farms/colors";
import { UserSelectors } from "./user";
import { getUserAssetDataWithPrices, UserAssetDataWithPrices } from "v2/utils/user";
import { getUniV3Tokens } from "v2/utils/univ3";
import { allAssets, enabledPredicate } from "./core.helpers";

const apiHost = process.env.apiHost;

export const fetchCore = createAsyncThunk<PickleModelJson>("core/fetch", async () => {
  const response = await fetch(`${apiHost}/protocol/pfcore`);
  return await response.json();
});

export interface UniV3Token {
  address: string;
  approved: boolean;
  name: string;
  decimals: number;
  isNative: boolean;
}

export interface JarWithData extends JarDefinition, UserAssetDataWithPrices {
  [SortType.Earned]: number | undefined;
  [SortType.Deposited]: number | undefined;
  [SortType.Apy]: number | undefined;
  [SortType.Liquidity]: number | undefined;
  token0: UniV3Token | undefined;
  token1: UniV3Token | undefined;
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

  allAssets(data).forEach((jar) => {
    if (jar.enablement !== AssetEnablement.ENABLED) return;

    protocols.push(jar.protocol);

    const { components } = jar.depositToken;

    if (!components) return;

    tokens.push(...components);
  });

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

/**
 * TODO: Refactor codebase to work with all enabled assets, i.e. use
 * selectEnabledAssets so we can remove selectEnabledJars. This breaks a lot
 * of types at the moment so using all assets only where possible for now.
 */
const selectEnabledAssets = (state: RootState) => {
  const { data } = state.core;

  if (data === undefined) return [];

  return allAssets(data).filter(enabledPredicate);
};
const selectEnabledJars = (state: RootState) => {
  const { data } = state.core;

  if (data === undefined) return [];

  return data.assets.jars.filter(enabledPredicate);
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
  account?: string | null | undefined;
}

const makeJarsSelector = (options: MakeJarsSelectorOpts = {}) => {
  const selectJarsFunction = options.filtered ? selectFilteredAssets : selectEnabledJars;

  return createSelector(
    selectJarsFunction,
    selectCore,
    ControlsSelectors.selectPaginateParams,
    ControlsSelectors.selectSort,
    (state: RootState) => UserSelectors.selectData(state, options.account),
    (jars, allCore, pagination, sort, userModel) => {
      // Sort first, and then compute pagination
      let jarsWithData: JarWithData[] = jars.map((jar) => {
        let token0, token1;
        if (jar.protocol === AssetProtocol.UNISWAP_V3)
          [token0, token1] = getUniV3Tokens(jar, allCore);
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
          token0,
          token1,
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

  // Only jars users can currently invest in (not withdraw-only)
  const jars = selectEnabledAssets(state).filter(
    (asset) => asset.enablement === AssetEnablement.ENABLED,
  );
  const entries = jars.map((jar) => {
    let farmApr = 0;
    const apy = jar.aprStats?.apy || 0;

    if ("farm" in jar) {
      const farmApyComponents = jar.farm?.details?.farmApyComponents;

      if (farmApyComponents?.length) {
        farmApr = farmApyComponents[0].apr;
      }

      return {
        name: jar.depositToken.name,
        chain: data.chains.find((chain) => chain.network === jar.chain)!.networkVisible,
        apy: apy + farmApr,
      };
    }
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
const selectETHPrice = (state: RootState): number => {
  const prices = selectPrices(state);

  return prices ? prices["weth"] : 0;
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
  selectETHPrice,
};

export default coreSlice.reducer;
