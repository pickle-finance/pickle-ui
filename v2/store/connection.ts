import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChainNetwork } from "picklefinance-core/lib/chain/Chains";

import { RootState } from ".";

interface ConnectionState {
  blockNumber: number | undefined;
  network: ChainNetwork | undefined;
  isManuallyDeactivated: boolean;
  isModalOpen: boolean;
}

const initialState: ConnectionState = {
  blockNumber: undefined,
  network: undefined,
  isManuallyDeactivated: false,
  isModalOpen: false,
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
    setIsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
  },
});

export const {
  updateBlockNumber,
  setIsManuallyDeactivated,
  setIsModalOpen,
} = connectionSlice.actions;

/**
 * Selectors
 */
const selectBlockNumber = (state: RootState) => state.connection.blockNumber;
const selectIsManuallyDeactivated = (state: RootState) =>
  state.connection.isManuallyDeactivated;
const selectIsModalOpen = (state: RootState) => state.connection.isModalOpen;

export const ConnectionSelectors = {
  selectBlockNumber,
  selectIsManuallyDeactivated,
  selectIsModalOpen,
};

export default connectionSlice.reducer;
