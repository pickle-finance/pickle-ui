import { FC } from "react";

export interface PickleFinancePage extends FC {
  PageTitle: FC;
}

export interface JarDetails {
  name: string;
  chain: string;
  apy: number;
}

// types for platform api data on dill page
export interface TvlData {
  value: number;
  asset: string;
  height: number;
  timestamp: number;
}
export interface RevenueData {
  revsUsd: number;
  jarKey: string;
  timestamp: number;
  harvestCount: number;
  gasUsd: number;
  earnCount: number;
}

export interface PlatformChainCoreData {
  chainId: string;
  periodRevenue: number;
  previousPeriodRevenue: number;
  previousTvl: number;
  tvl: number;
}

export interface PlatformChainData {
  [chain: string]: PlatformChainCoreData;
}

export interface PlatformData {
  tvl: TvlData[];
  revenues: RevenueData[];
  chains: PlatformChainData;
}
// end platform types