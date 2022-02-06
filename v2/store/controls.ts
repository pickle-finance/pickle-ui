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

export const itemsPerPage = 20;

interface ControlsState {
  filters: Filter[];
  matchAllFilters: boolean;
  sort: Sort;
  currentPage: number;
}

const initialState: ControlsState = {
  filters: [],
  matchAllFilters: false,
  currentPage: 0,
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
      state.currentPage = 0;
    },
    setMatchAllFilters: (state, action: PayloadAction<boolean>) => {
      state.matchAllFilters = action.payload;
    },
    setSort: (state, action: PayloadAction<Sort>) => {
      state.sort = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
});

/**
 * Actions
 */
export const { setFilters, setMatchAllFilters, setSort, setCurrentPage } = controlsSlice.actions;

/**
 * Selectors
 */
const selectFilters = (state: RootState) => state.controls.filters;
const selectMatchAllFilters = (state: RootState) => state.controls.matchAllFilters;
const selectSort = (state: RootState) => state.controls.sort;
const selectPaginateParams = (state: RootState) => ({
  currentPage: state.controls.currentPage,
  itemsPerPage,
  offset: state.controls.currentPage * itemsPerPage,
});

export const ControlsSelectors = {
  selectFilters,
  selectMatchAllFilters,
  selectSort,
  selectPaginateParams,
};

export default controlsSlice.reducer;
