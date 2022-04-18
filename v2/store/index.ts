import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import coreReducer from "./core";
import docsReducer from "./docs";
import connectionReducer from "./connection";
import userReducer from "./user";
import controlsReducer from "./controls";
import themeReducer from "./theme";
import voteReducer from "./offchainVotes";
import { persistSlice } from "./localStorage";
import { listenerMiddleware } from "./listenerMiddleware";

export const store = configureStore({
  reducer: {
    core: coreReducer,
    docs: docsReducer,
    connection: connectionReducer,
    user: persistSlice(userReducer, "user") as typeof userReducer,
    controls: controlsReducer,
    theme: themeReducer,
    offchainVotes: voteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export type AppDispatch = ReturnType<typeof useAppDispatch>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
