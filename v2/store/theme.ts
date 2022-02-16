import { PayloadAction, createSlice } from "@reduxjs/toolkit";

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

export const ThemeSelectors = {
  selectTheme,
};

export default themeSlice.reducer;
