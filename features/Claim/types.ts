import { BigNumberish } from "ethers";

export interface Snapshot {
  [address: string]: string;
}

export interface ClaimsByWeek {
  [week: string]: Snapshot;
}

export interface AmountsByWeek {
  [week: string]: string;
}

export interface DistributionRootByWeek {
  [week: string]: string;
}

export interface ClaimStatusByWeek {
  [week: string]: boolean;
}

export interface TokenClaimInfo {
  label: string;
  distributor: string;
  token: string;
  manifest: string;
  weekStart: number;
}

export interface Prices {
  bal: number;
  pickle: number;
  [token: string]: number;
}

export interface ClaimableAmounts {
  [token: string]: {
    [token: string]: number;
    usd: number;
  };
}

/**
 * distributionId, balance, distributor, tokenIndex, merkleProof
 * See https://docs.balancer.fi/products/merkle-orchard/claiming-tokens#claiming-from-the-contract-directly
 */
export type ClaimProof = {
  distributionId: number;
  balance: BigNumberish;
  distributor: string;
  tokenIndex: number;
  merkleProof: string[];
};
