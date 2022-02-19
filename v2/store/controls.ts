import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { RootState } from ".";

export enum FilterType {
  Token = "token",
  Protocol = "protocol",
  Network = "network",
}

export type Sort = {
  type: SortType;
  direction: SortDirection;
};

export type SortDirection = "asc" | "desc";

export enum SortType {
  Earned = "earned",
  Deposited = "deposited",
  Apy = "apy",
  Liquidity = "liquidity",
  None = "none",
}

export interface Filter {
  type: FilterType;
  value: string;
  label: string;
  color: string;
  imageSrc: string;
}

interface ControlsState {
  filters: Filter[];
  matchAllFilters: boolean;
  sort: Sort;
}

const initialState: ControlsState = {
  filters: [],
  matchAllFilters: false,
  sort: {
    type: SortType.Earned,
    direction: "desc",
  },
};

const controlsSlice = createSlice({
  name: "controls",
  initialState,
  reducers: {
    // We need to accept a readonly payload since this is what is provided
    // by react-select. We spread the array later so we can work with it.
    setFilters: (state, action: PayloadAction<readonly Filter[]>) => {
      state.filters = [...action.payload];
    },
    setMatchAllFilters: (state, action: PayloadAction<boolean>) => {
      state.matchAllFilters = action.payload;
    },
    setSort: (state, action: PayloadAction<Sort>) => {
      state.sort = action.payload;
    },
  },
});

/**
 * Actions
 */
export const {
  setFilters,
  setMatchAllFilters,
  setSort,
} = controlsSlice.actions;

/**
 * Selectors
 */
const selectFilters = (state: RootState) => state.controls.filters;
const selectMatchAllFilters = (state: RootState) =>
  state.controls.matchAllFilters;
const selectSort = (state: RootState) => state.controls.sort;

export const ControlsSelectors = {
  selectFilters,
  selectMatchAllFilters,
  selectSort,
};

export default controlsSlice.reducer;
