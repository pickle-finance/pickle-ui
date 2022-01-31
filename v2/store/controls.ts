import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { RootState } from ".";

export enum FilterType {
  Token = "token",
  Protocol = "protocol",
  Network = "network",
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
}

const initialState: ControlsState = {
  filters: [],
  matchAllFilters: false,
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
  },
});

/**
 * Actions
 */
export const { setFilters, setMatchAllFilters } = controlsSlice.actions;

/**
 * Selectors
 */
const selectFilters = (state: RootState) => state.controls.filters;
const selectMatchAllFilters = (state: RootState) =>
  state.controls.matchAllFilters;

export const ControlsSelectors = {
  selectFilters,
  selectMatchAllFilters,
};

export default controlsSlice.reducer;
