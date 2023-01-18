import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { maxBy, orderBy } from "lodash";
import {
  AssetEnablement,
  AssetProtocol,
  BrineryDefinition,
  ExternalAssetDefinition,
  JarDefinition,
  PickleModelJson,
  StandaloneFarmDefinition,
} from "picklefinance-core/lib/model/PickleModelJson";

import { RootState } from ".";
import { Filter, FilterType, ControlsSelectors, SortType } from "./controls";
import { getNetworks } from "v2/features/connection/networks";
import { brandColor } from "v2/features/farms/colors";
import { UserSelectors } from "./user";
import {
  getUserAssetDataWithPrices,
  getUserBrineryDataWithPrices,
  UserAssetDataWithPrices,
  UserAssetDataWithPricesComponent,
  UserBrineryDataWithPrices,
} from "v2/utils/user";
import { getUniV3Tokens } from "v2/utils/univ3";
import { allAssets, enabledPredicate } from "./core.helpers";
import { toTitleCase } from "v2/utils/format";

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

interface SortTypes {
  [SortType.Earned]: number | undefined;
  [SortType.Deposited]: number | undefined;
  [SortType.Apy]: number | undefined;
  [SortType.Liquidity]: number | undefined;
}

interface ExtraAssetData extends UserAssetDataWithPrices, SortTypes {}
export interface JarWithData extends JarDefinition, ExtraAssetData {
  token0: UniV3Token | undefined;
  token1: UniV3Token | undefined;
}
export interface StandaloneFarmWithData extends StandaloneFarmDefinition, ExtraAssetData {}
export interface ExternalAssetWithData extends ExternalAssetDefinition, ExtraAssetData {}
export type AssetWithData = JarWithData | StandaloneFarmWithData | ExternalAssetWithData;

export interface BrineryWithData extends BrineryDefinition, UserBrineryDataWithPrices, SortTypes {}

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

  const tagFilters = [
    ...new Set(
      data.assets.jars
        .filter((jar) => jar.tags)
        .flatMap((jars) => {
          const { tags } = jars;
          return tags?.map((tag) => tag);
        }),
    ),
  ].map((tag) => ({
    type: FilterType.Tag,
    value: tag || "",
    label: toTitleCase(tag || ""),
    imageSrc: tag === "stablecoins" ? `/tokens/usdc.png` : `/gray.png`,
    color: brandColor("usdc"),
  }));

  return [...networkFilters, ...protocolFilters, ...tokenFilters, ...tagFilters];
};

/**
 * Selectors
 */
const selectCore = (state: RootState) => state.core.data;

const selectEnabledAssets = (state: RootState) => {
  const { data } = state.core;

  if (data === undefined) return [];

  return allAssets(data).filter(enabledPredicate);
};
const selectEnabledBrineries = (state: RootState) => {
  const { data } = state.core;

  if (data === undefined) return [];

  return data.assets.brineries.filter(enabledPredicate);
};

const selectFilteredAssets = createSelector(
  selectEnabledAssets,
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
          case FilterType.Tag:
            const { tags } = jar;
            if (!tags) return false;
            return tags.includes(filter.value);

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

const makeAssetsSelector = (options: MakeJarsSelectorOpts = {}) => {
  const selectAssetsFunction = options.filtered ? selectFilteredAssets : selectEnabledAssets;

  return createSelector(
    selectAssetsFunction,
    selectCore,
    ControlsSelectors.selectPaginateParams,
    ControlsSelectors.selectSort,
    (state: RootState) => UserSelectors.selectData(state, options.account),
    (assets, allCore, pagination, sort, userModel) => {
      // Sort first, and then compute pagination
      let assetsWithData: AssetWithData[] = assets.map((asset) => {
        let token0, token1;
        let farmApr = 0;
        if ("farm" in asset) {
          const farmApyComponents = asset.farm?.details?.farmApyComponents;

          if (farmApyComponents?.length) {
            farmApr = farmApyComponents[0].apr;
          }
        }
        if (asset.protocol === AssetProtocol.UNISWAP_V3)
          [token0, token1] = getUniV3Tokens(asset, allCore);
        const data = getUserAssetDataWithPrices(asset, allCore, userModel);
        const deposited = data.depositTokensInJar.tokensUSD + data.depositTokensInFarm.tokensUSD;
        const earned = data.earnedPickles.tokensUSD || 0;
        const apy = (asset.aprStats?.apy || 0) + farmApr;
        const liquidity = asset.details.harvestStats?.balanceUSD || 0;
        return {
          ...asset,
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
        assetsWithData = orderBy(assetsWithData, [sort.type], [sort.direction]);
      } else {
        assetsWithData = defaultSortingLogic(assetsWithData);
      }

      if (options.paginated) {
        const { offset, itemsPerPage } = pagination;
        const endOffset = offset + itemsPerPage;

        return assetsWithData.slice(offset, endOffset);
      }

      return assetsWithData;
    },
  );
};

const defaultSortingLogic = (assetsWithData: AssetWithData[]): AssetWithData[] => {
  const ret = assetsWithData.sort((a, b) => {
    const aHasDeposit = a.deposited && a.deposited > 0;
    const bHasDeposit = b.deposited && b.deposited > 0;

    if (aHasDeposit && !bHasDeposit) return -1;
    if (bHasDeposit && !aHasDeposit) return 1;
    if (aHasDeposit && bHasDeposit) return (a.deposited || 0) > (b.deposited || 0) ? -1 : 1;

    // Neither have deposits
    // Check enablement
    if (a.enablement === AssetEnablement.ENABLED && b.enablement !== AssetEnablement.ENABLED)
      return -1;
    if (b.enablement === AssetEnablement.ENABLED && a.enablement !== AssetEnablement.ENABLED)
      return 1;
    const aHasDepositTokens =
      a.depositTokensInWallet &&
      a.depositTokensInWallet.tokensUSD &&
      a.depositTokensInWallet.tokensUSD > 0;
    const bHasDepositTokens =
      b.depositTokensInWallet &&
      b.depositTokensInWallet.tokensUSD &&
      b.depositTokensInWallet.tokensUSD > 0;

    if (aHasDepositTokens && !bHasDepositTokens) return -1;
    if (bHasDepositTokens && !aHasDepositTokens) return 1;
    if (aHasDepositTokens && bHasDepositTokens)
      return (a.depositTokensInWallet.tokensUSD || 0) > (b.depositTokensInWallet.tokensUSD || 0)
        ? -1
        : 1;

    // Neither is deposited and neither have deposit tokens
    // Now check component tokens
    const sumComponents = (v: { [key: string]: UserAssetDataWithPricesComponent }): number => {
      let totalUSD = 0;
      const keys: string[] = Object.keys(v);
      for (let i = 0; i < keys.length; i++) {
        totalUSD += v[keys[i]].tokensUSD;
      }
      return totalUSD;
    };
    const aComponentTokensUSD = a.walletComponentTokens
      ? sumComponents(a.walletComponentTokens)
      : 0;
    const bComponentTokensUSD = b.walletComponentTokens
      ? sumComponents(b.walletComponentTokens)
      : 0;

    if (aComponentTokensUSD && !bComponentTokensUSD) return -1;
    if (bComponentTokensUSD && !aComponentTokensUSD) return 1;
    if (aComponentTokensUSD && bComponentTokensUSD)
      return aComponentTokensUSD > aComponentTokensUSD ? -1 : 1;

    return 0;
  });
  return ret;
};

const makeBrinerySelector = (options: MakeJarsSelectorOpts = {}) => {
  return createSelector(
    selectEnabledBrineries,
    selectCore,
    (state: RootState) => UserSelectors.selectData(state, options.account),
    (brineries, allCore, userModel) => {
      let brineriesWithData: BrineryWithData[] = brineries.map((brinery) => {
        const data = getUserBrineryDataWithPrices(brinery, allCore, userModel);

        const deposited = data.brineryBalance.tokensUSD;
        const earned = 0;
        const apy = brinery.aprStats?.apy || 0;
        const liquidity = brinery.details.harvestStats?.balanceUSD || 0;
        return {
          ...brinery,
          ...data,
          deposited,
          earned,
          apy,
          liquidity,
        };
      });
      return brineriesWithData;
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
    }
    return {
      name: jar.depositToken.name,
      chain: data.chains.find((chain) => chain.network === jar.chain)!.networkVisible,
      apy: apy + farmApr,
      tokens: jar.depositToken.components,
      protocol: jar.protocol,
    };
  });

  // Filtering out jars with ridiculous APY
  const filteredEntries = entries.filter((entry) => entry?.apy && entry.apy < 10000);
  return maxBy(filteredEntries, "apy")!;
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
  makeAssetsSelector,
  makeBrinerySelector,
  selectCore,
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
