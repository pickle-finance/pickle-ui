import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

import coreReducer from "./core";
import connectionReducer from "./connection";

export const store = configureStore({
  reducer: {
    core: coreReducer,
    connection: connectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
