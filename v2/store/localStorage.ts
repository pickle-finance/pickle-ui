import { Reducer } from "@reduxjs/toolkit";

type StoreStateObject = {
  [key: string]: any;
};

const STORE_KEY = "pickle-finance-storage";

export const persistSlice = (reducer: Reducer, name: string = "reducer"): any => (
  state: any,
  action: any,
) => {
  if (typeof window === "undefined") return reducer;

  const storageItem = localStorage.getItem(STORE_KEY);
  let store: StoreStateObject = storageItem ? JSON.parse(storageItem) : {};

  const next = reducer(state || store[name], action);

  store = { ...store, [name]: next };

  localStorage.setItem(STORE_KEY, JSON.stringify(store));

  return next;
};
