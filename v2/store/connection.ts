import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChainNetwork } from "picklefinance-core/lib/chain/Chains";

import { RootState } from ".";

interface ConnectionState {
  blockNumber: number | undefined;
  network: ChainNetwork | undefined;
}

const initialState: ConnectionState = {
  blockNumber: undefined,
  network: undefined,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    updateBlockNumber: (state, action: PayloadAction<number>) => {
      state.blockNumber = action.payload;
    },
  },
});

export const { updateBlockNumber } = connectionSlice.actions;

/**
 * Selectors
 */
const selectBlockNumber = (state: RootState) => state.connection.blockNumber;

export const ConnectionSelectors = {
  selectBlockNumber,
};

export default connectionSlice.reducer;
