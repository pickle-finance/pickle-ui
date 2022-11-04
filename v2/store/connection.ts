import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConnectionType } from "v2/features/connection/connectors";

import { RootState } from ".";

interface ConnectionErrorState {
  errorByConnectionType: Record<ConnectionType, string | undefined>;
}
// Record<ConnectionType, string | undefined>;
interface ConnectionState {
  isManuallyDeactivated: boolean;
  isModalOpen: boolean;
  errorByConnectionType: ConnectionErrorState;
}

const initiaErrorState: ConnectionErrorState = {
  errorByConnectionType: {
    [ConnectionType.Metamask]: undefined,
    [ConnectionType.WalletConnect]: undefined,
    [ConnectionType.Coinbase]: undefined,
  },
};
const initialState: ConnectionState = {
  isManuallyDeactivated: false,
  isModalOpen: false,
  errorByConnectionType: initiaErrorState,
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
    updateConnectionError(
      state,
      {
        payload: { connectionType, error },
      }: { payload: { connectionType: ConnectionType; error: string | undefined } },
    ) {
      state.errorByConnectionType[connectionType] = error;
    },
  },
});

export const {
  setIsManuallyDeactivated,
  setIsModalOpen,
  updateConnectionError,
} = connectionSlice.actions;

/**
 * Selectors
 */
const selectIsManuallyDeactivated = (state: RootState) => state.connection.isManuallyDeactivated;
const selectIsModalOpen = (state: RootState) => state.connection.isModalOpen;
const selectError = (state: RootState, type: ConnectionType | undefined) =>
  type ? state.connection.errorByConnectionType[type] : undefined;

export const ConnectionSelectors = {
  selectIsManuallyDeactivated,
  selectIsModalOpen,
  selectError,
};

export default connectionSlice.reducer;
