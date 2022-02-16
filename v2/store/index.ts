import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

import coreReducer from "./core";
import connectionReducer from "./connection";
import userReducer from "./user";
import controlsReducer from "./controls";
import themeReducer from "./theme";

export const store = configureStore({
  reducer: {
    core: coreReducer,
    connection: connectionReducer,
    user: userReducer,
    controls: controlsReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
