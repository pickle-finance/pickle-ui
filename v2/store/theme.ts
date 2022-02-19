import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { startAppListening } from "./listenerMiddleware";

import { RootState } from ".";

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
  effect: async (action) => {
    console.log("~~~ Theme changed: ", action.payload);

    let root = document.documentElement;

    switch (action.payload) {
      case "light":
        root.style.setProperty("--color-foreground", "3, 19, 22");
        break;
      case "dark":
        root.style.setProperty("--color-foreground", "255, 255, 255");
        break;
      case "rare":
        root.style.setProperty("--color-foreground", "0, 255, 0");
        break;
    }
  },
});

export const ThemeSelectors = {
  selectTheme,
};

export default themeSlice.reducer;
