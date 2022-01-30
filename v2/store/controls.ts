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
  readonly filters: Filter[];
}

const initialState: ControlsState = {
  filters: [],
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
  },
});

/**
 * Actions
 */
export const { setFilters } = controlsSlice.actions;

/**
 * Selectors
 */
const selectFilters = (state: RootState) => state.controls.filters;

export const ControlsSelectors = {
  selectFilters,
};

export default controlsSlice.reducer;
