import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { QueryStatus } from "@reduxjs/toolkit/query";

import { RootState } from ".";

interface VoteState {
  data: iOffchainVoteData | undefined;
  loading: keyof typeof QueryStatus;
}

const initialState: VoteState = {
  data: undefined,
  loading: "uninitialized",
};

export interface iOffchainVoteData {
  chains: ChainVote[];
  votes: UserVote[];
}

export interface ChainVote {
  chain: string;
  rawChainWeight: number;
  adjustedChainWeight: number;
  jarVotes: JarVote[];
}

export interface JarVote {
  key: string;
  rawJarVote: number;
  adjustedJarVote: number;
  jarVoteAsRawVoteShare: number;
  jarVoteAsChainEmissionShare: number | null;
  jarVoteAsEmissionShare: number;
}

export interface UserVote {
  dillWeight: iDillWeight;
  chainWeights?: iChainWeight[];
  jarWeights?: iJarWeight[];
  length: number;
  timestamp: number;
  wallet: string;
}

interface iDillWeight {
  type: string;
  hex: string;
}

export interface iChainWeight {
  chain: string;
  weight: number;
}

export interface iJarWeight {
  jarKey: string;
  weight: number;
}

const apiHost = process.env.apiHost;

export const fetchOffchainVoteData = createAsyncThunk<iOffchainVoteData>(
  "offchainVotes/fetch",
  async () => {
    const response = await fetch(`${apiHost}/protocol/dill/offchainVotes/current`);
    return await response.json();
  },
);

const offchainVoteSlice = createSlice({
  name: "offchainVotes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOffchainVoteData.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(fetchOffchainVoteData.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = "fulfilled";
    });
  },
});

/**
 * Selectors
 */
const selectVoteData = (state: RootState) => state.offchainVotes.data;

export const VoteSelectors = {
  selectVoteData,
};

export default offchainVoteSlice.reducer;
