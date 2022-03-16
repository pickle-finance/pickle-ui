import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from ".";

interface ConnectionState {
  isManuallyDeactivated: boolean;
  isModalOpen: boolean;
}

const initialState: ConnectionState = {
  isManuallyDeactivated: false,
  isModalOpen: false,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setIsManuallyDeactivated: (state) => {
      state.isManuallyDeactivated = true;
    },
    setIsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
  },
});

export const { setIsManuallyDeactivated, setIsModalOpen } = connectionSlice.actions;

/**
 * Selectors
 */
const selectIsManuallyDeactivated = (state: RootState) => state.connection.isManuallyDeactivated;
const selectIsModalOpen = (state: RootState) => state.connection.isModalOpen;

export const ConnectionSelectors = {
  selectIsManuallyDeactivated,
  selectIsModalOpen,
};

export default connectionSlice.reducer;
