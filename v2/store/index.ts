import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import coreReducer from "./core";
import docsReducer from "./docs";
import connectionReducer from "./connection";
import userReducer from "./user";
import controlsReducer from "./controls";
import themeReducer from "./theme";
import { listenerMiddleware } from "./listenerMiddleware";

export const store = configureStore({
  reducer: {
    core: coreReducer,
    docs: docsReducer,
    connection: connectionReducer,
    user: userReducer,
    controls: controlsReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
