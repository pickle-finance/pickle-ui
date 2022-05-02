import { AnyAction, Reducer } from "@reduxjs/toolkit";

type StoreStateObject = {
  [key: string]: any;
};

const STORE_KEY = "pickle-v2";

export const persistSlice = <T>(reducer: Reducer<T>, name: string = "reducer"): Reducer<T> => (
  state: T | undefined,
  action: AnyAction,
): T => {
  if (typeof window === "undefined") return reducer as any;

  const storageItem = localStorage.getItem(STORE_KEY);
  let store: StoreStateObject = storageItem ? JSON.parse(storageItem) : {};

  const next = reducer(state || store[name], action);

  store = { ...store, [name]: next };

  localStorage.setItem(STORE_KEY, JSON.stringify(store));

  return next;
};
