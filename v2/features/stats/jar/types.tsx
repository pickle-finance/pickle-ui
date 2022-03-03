export interface SelectData {
  value: string;
  label: string;
}

interface Component {
  count: number;
  id: string;
  price: number;
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

interface AssetData {
  [key: string]: AssetCoreData[];
}

export interface AssetDocs {
  apiKey: string;
  description: string;
  obtain: string[];
  risks: string[];
  social: string[];
}

interface DailyRevExp {
  expensesUsd: number;
  revsUsd: number;
  timeStart: number;
}

export interface Transfer {
  decimals: number;
  token: string;
  tokenAddr: string;
  unitPrice: string;
  usdval: number;
  weiSent: string;
}

export interface RecentHarvest {
  action: string;
  expectedAmount: number;
  fee: number;
  gasPrice: string;
  gasTokenPrice: number;
  gasUsed: string;
  jarKey: string;
  timestamp: number
  transfers: Transfer[];
  txid: string;
}

export interface AssetRevs {
  daily: DailyRevExp[];
  recentHarvests: RecentHarvest[];
}

export interface JarChartData {
  apiKey: string;
  assetData: AssetData;
  documentation: AssetDocs;
  revenueExpenses: AssetRevs;
}
