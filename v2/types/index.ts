import { AssetDocumentationResult } from "picklefinance-core/lib/docModel/DocsInterfaces";
import { FC } from "react";

export interface PickleFinancePage extends FC {
  PageTitle: FC;
}

export interface JarDetails {
  name: string;
  chain: string;
  apy: number;
}

// STATS
// common
export interface TvlData {
  value: number;
  asset: string;
  height: number;
  timestamp: number;
}

export interface RevenueData {
  revsUsd: number;
  ma?: number;
  jarKey: string;
  timestamp: number;
  harvestCount: number;
  gasUsd: number;
  earnCount: number;
}

// PLATFORM
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

export interface AssetCoreData {
  asset: string;
  balance: number;
  depositTokenComponents: Component[];
  depositTokenPrice: number;
  farmAllocShare: number;
  farmMaxApy: number;
  farmMinApy: number;
  farmPicklePerDay: number;
  harvestable: number;
  height: number;
  interval: number;
  jarApr: number;
  jarApy: number;
  ptokensInFarm: number;
  ratio: number;
  supply: number;
  timestamp: number;
  value: number;
}

// CHAIN
export interface ChainData {
  chainId: string;
  tvl: TvlData[];
  revenues: RevenueData[];
  assets: ChainAssetData;
}

export interface ChainAssetData {
  [assetName: string]: AssetChangeData;
}
export interface AssetChangeData {
  now: AssetCoreData;
  previous: AssetCoreData;
}

interface Component {
  count: number;
  id: string;
  price: number;
}
// JAR
export interface JarChartData {
  apiKey: string;
  assetData: JarAssetData;
  documentation: AssetDocumentationResult;
  revenueExpenses: AssetRevs;
}
interface JarAssetData {
  [key: string]: AssetCoreData[];
}

interface Component {
  count: number;
  id: string;
  price: number;
}

export interface AssetRevs {
  daily: DailyRevExp[];
  recentHarvests: RecentHarvest[];
}

export interface DailyRevExp {
  expensesUsd: number;
  revsUsd: number;
  ma?: number;
  timeStart: number;
}

export interface RecentHarvest {
  action: string;
  expectedAmount: number;
  fee: number;
  gasPrice: string;
  gasTokenPrice: number;
  gasUsed: string;
  jarKey: string;
  timestamp: number;
  transfers: Transfer[];
  txid: string;
}

export interface Transfer {
  decimals: number;
  token: string;
  tokenAddr: string;
  unitPrice: string;
  usdval: number;
  weiSent: string;
}

export interface ApyChartData {
  timestamp: number;
  jarApr: number;
  minApy: number;
  maxApy: number;
}

export interface SelectData {
  value: string;
  label: string;
}

export type SetFunction = (property: any) => void;
