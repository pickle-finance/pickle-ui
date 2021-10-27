import { useState, useEffect } from "react";
import { getPickleCore } from "../../util/api";
import { createContainer } from "unstated-next";
import { Connection } from "../Connection"

interface PickleAsset {
  type: string;
  id: string;
  contract: string;
  depositToken: DepositToken;
  enablement: string;
  chain: string;
  protocol: string;
  aprStats?: AssetProjectedApr;
  details: AssetDetails;
}

interface ExternalAssetDefinition extends PickleAsset {
  details: ExternalDetails;
  farm?: NestedFarm;
}

interface JarDefinition extends PickleAsset {
  details: JarDetails;
  farm?: NestedFarm;
}
interface StandaloneFarmDefinition extends PickleAsset {
  details: StandaloneFarmDetails;
  farmNickname: string;
}

interface DepositToken {
  addr: string;
  name: string;
  link: string;
  decimals?: number;
  totalSupply?: number;
  components?: string[];
  componentTokens?: number[];
  // style?: DepositTokenStyle,   // nothing in the pfcore response uses this
  price?: number;
}

interface AssetProjectedApr {
  components: AssetAprComponent[];
  apr: number;
  apy: number;
}

interface AssetAprComponent {
  name: string;
  apr: number;
  maxApr?: number;
  compoundable: boolean;
}

interface AssetDetails {
  apiKey?: string;
  harvestStats?: JarHarvestStats | ActiveJarHarvestStats;
}

interface JarHarvestStats {
  balanceUSD: number;
  earnableUSD: number;
  harvestableUSD: number;
}

interface ExternalDetails extends AssetDetails {
  includeInTvl?: boolean;
}

interface NestedFarm {
  farmAddress: string;
  farmDepositTokenName: string;
  farmNickname: string;
  details?: FarmDetails;
}

interface FarmDetails {
  allocShare?: number;
  tokenBalance?: number;
  valueBalance?: number;
  picklePerBlock?: number;
  picklePerDay?: number;
  farmApyComponents?: AssetAprComponent[];
  historicalApy?: HistoricalAPY;
}

interface HistoricalAPY {
  d1?: number;
  d3?: number;
  d7?: number;
  d30?: number;
}

interface JarDetails extends AssetDetails {
  decimals?: number;
  harvestStyle: "active" | "passive" | "earnBeforeHarvest";
  controller?: string;
  strategyName?: string;
  strategyAddr?: string;
  ratio?: number;
  totalSupply?: number;
  tokenBalance?: number;
  historicalApy?: HistoricalAPY;
}

interface ActiveJarHarvestStats extends JarHarvestStats {
  suppliedUSD: number;
  borrowedUSD: number;
  marketColFactor: number;
  currentColFactor: number;
  currentLeverage: number;
}

interface StandaloneFarmDefinition extends PickleAsset {
  details: StandaloneFarmDetails;
  farmNickname: string;
}

interface StandaloneFarmDetails extends AssetDetails, FarmDetails {}

export interface PickleCoreModel {
  tokens: {
    chain: string;
    id: string;
    contractAddr: string;
    decimals: number;
  }[];
  prices: Record<string, number>;
  dill: {
    pickleLocked: number;
    totalDill: number;
    dillWeeks: {
      weeklyPickleAmount: number;
      totalPickleAmount: number;
      weeklyDillAmount: number;
      totalDillAmount: number;
      pickleDillRatio: number;
      picklePriceUsd: number;
      buybackUsd: number;
      isProjected: boolean;
      distributionTime: Date;
    }[];
  };
  assets: {
    jars: JarDefinition[];
    standaloneFarms: StandaloneFarmDefinition[];
    external: ExternalAssetDefinition[];
  };
  platform: {
    platformTVL: number;
    platformBlendedRate: number;
    harvestPending: number;
  };
  timestamp: number;
}

const usePickleCore = () => {
    const [pickleCore, setPickleCore] = useState<PickleCoreModel | null>(null);
    const { blockNum } = Connection.useContainer();
    const fetchPickleCore = async () => { setPickleCore(<PickleCoreModel>await getPickleCore()) }

    useEffect(() => {
        fetchPickleCore();
    }, [, blockNum]);   // TODO: should be changed to something less frequent
    
    return { pickleCore, };
};

export const PickleCore = createContainer(usePickleCore);

