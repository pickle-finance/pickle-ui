import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { startAppListening } from "./listenerMiddleware";

import { RootState } from ".";
import { applyTheme, currentTheme } from "v2/features/theme/themes";

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
  isConfettiOn: boolean;
}

const initialState: ThemeState = {
  type: ThemeType.Dark,
  current: { label: "9-to-5", value: "9-to-5" },
  isConfettiOn: false,
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
    setIsConfettiOn: (state, action: PayloadAction<boolean>) => {
      state.isConfettiOn = action.payload;
    },
  },
});

/**
 * Actions
 */
export const { setThemeType, setCurrentTheme, setIsConfettiOn } = themeSlice.actions;
export const ThemeActions = {
  setThemeType,
  setCurrentTheme,
  setIsConfettiOn,
};

/**
 * Selectors
 */
const selectTheme = (state: RootState) => state.theme;
const selectThemeTone = (state: RootState) => currentTheme(state.theme).tone;
const selectIsConfettiOn = (state: RootState) => state.theme.isConfettiOn;

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
  selectIsConfettiOn,
  selectTheme,
  selectThemeTone,
};

export default themeSlice.reducer;
