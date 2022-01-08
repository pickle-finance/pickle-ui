import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChainNetwork } from "picklefinance-core/lib/chain/Chains";

import { RootState } from ".";

interface ConnectionState {
  blockNumber: number | undefined;
  network: ChainNetwork | undefined;
  isManuallyDeactivated: boolean;
}

const initialState: ConnectionState = {
  blockNumber: undefined,
  network: undefined,
  isManuallyDeactivated: false,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    updateBlockNumber: (state, action: PayloadAction<number>) => {
      state.blockNumber = action.payload;
    },
    setIsManuallyDeactivated: (state) => {
      state.isManuallyDeactivated = true;
    },
  },
});

export const {
  updateBlockNumber,
  setIsManuallyDeactivated,
} = connectionSlice.actions;

/**
 * Selectors
 */
const selectBlockNumber = (state: RootState) => state.connection.blockNumber;
const selectIsManuallyDeactivated = (state: RootState) =>
  state.connection.isManuallyDeactivated;

export const ConnectionSelectors = {
  selectBlockNumber,
  selectIsManuallyDeactivated,
};

export default connectionSlice.reducer;
