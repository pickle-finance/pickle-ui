import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

import coreReducer from "./core";
import connectionReducer from "./connection";
import userReducer from "./user";

export const store = configureStore({
  reducer: {
    core: coreReducer,
    connection: connectionReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
