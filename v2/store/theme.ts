import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { startAppListening } from "./listenerMiddleware";

import { RootState } from ".";
import { applyTheme } from "v2/features/theme/themes";

export enum ThemeType {
  Light = "light",
  Dark = "dark",
  Rare = "rare",
}

interface ThemeState {
  type: ThemeType;
}

const initialState: ThemeState = {
  type: ThemeType.Dark,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeType: (state, action: PayloadAction<ThemeType>) => {
      state.type = action.payload;
    },
  },
});

/**
 * Actions
 */
export const { setThemeType } = themeSlice.actions;

/**
 * Selectors
 */
const selectTheme = (state: RootState) => state.theme;

/**
 * Listeners
 */
startAppListening({
  actionCreator: setThemeType,
  effect: (action) => applyTheme(action.payload),
});

export const ThemeSelectors = {
  selectTheme,
};

export default themeSlice.reducer;
