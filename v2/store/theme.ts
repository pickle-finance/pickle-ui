import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { startAppListening } from "./listenerMiddleware";

import { RootState } from ".";
import { applyTheme } from "v2/features/theme/themes";

export enum ThemeType {
  Light = "light",
  Dark = "dark",
  Rare = "rare",
}

export interface CurrentTheme {
  label: string;
  value: string;
}

export interface ThemeState {
  type: ThemeType;
  current: CurrentTheme;
}

const initialState: ThemeState = {
  type: ThemeType.Dark,
  current: { label: "9-to-5", value: "9-to-5" },
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeType: (state, action: PayloadAction<ThemeType>) => {
      state.type = action.payload;
    },
    setCurrentTheme: (state, action: PayloadAction<CurrentTheme>) => {
      state.current = action.payload;
    },
  },
});

/**
 * Actions
 */
export const { setThemeType, setCurrentTheme } = themeSlice.actions;

/**
 * Selectors
 */
const selectTheme = (state: RootState) => state.theme;

/**
 * Listeners
 */
startAppListening({
  actionCreator: setThemeType,
  effect: (_, listenerApi) => applyTheme(listenerApi.getState().theme),
});

startAppListening({
  actionCreator: setCurrentTheme,
  effect: (_, listenerApi) => applyTheme(listenerApi.getState().theme),
});

export const ThemeSelectors = {
  selectTheme,
};

export default themeSlice.reducer;
