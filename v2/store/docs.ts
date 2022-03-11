import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { DocumentationModelResult } from "picklefinance-core/lib/docModel/DocsInterfaces";

import { RootState } from ".";

const apiHost = process.env.apiHost;

export const fetchDocs = createAsyncThunk<DocumentationModelResult, string>(
  "docs/fetch",
  async (language) => {
    const response = await fetch(`${apiHost}/protocol/docs/${language}`);
    return await response.json();
  },
);

interface DocsState {
  data: DocumentationModelResult | undefined;
  loading: keyof typeof QueryStatus;
}

const initialState: DocsState = {
  data: undefined,
  loading: "uninitialized",
};

const docsSlice = createSlice({
  name: "docs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDocs.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(fetchDocs.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = "fulfilled";
    });
  },
});

/**
 * Selectors
 */
const selectDocs = (state: RootState) => state.docs.data;
const selectJarDocs = (state: RootState, apiKey: string) => {
  if (state.docs.data) return state.docs.data[apiKey];
};
const selectLoadingState = (state: RootState) => state.docs.loading;

export const DocsSelectors = {
  selectDocs,
  selectJarDocs,
  selectLoadingState,
};

export default docsSlice.reducer;
