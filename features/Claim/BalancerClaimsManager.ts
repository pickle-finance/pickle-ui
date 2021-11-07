import { tokenClaimInfoList } from "./config";
import { Prices, ClaimableAmounts, ClaimProofTuple } from "./types";
import { BalancerTokenClaim } from "./BalancerTokenClaim";

export class BalancerClaimsManager {
  private tokenClaims: BalancerTokenClaim[] = [];

  public tokens: string[] = [];

  constructor(private address: string, private prices: Prices) {}

  fetchData = async (): Promise<void> => {
    for (let index = 0; index < tokenClaimInfoList.length; index++) {
      const tokenClaimInfo = tokenClaimInfoList[index];
      const tokenClaim = new BalancerTokenClaim(
        tokenClaimInfo,
        index,
        this.address,
      );
      await tokenClaim.fetchData();

      this.tokenClaims.push(tokenClaim);
      this.tokens.push(tokenClaimInfo.token);
    }
  };

  get claimableAmounts(): ClaimableAmounts {
    return this.tokenClaims.reduce((amounts, claim) => {
      const { label } = claim.tokenClaimInfo;
      const { claimableAmount } = claim;

      return {
        ...amounts,
        [label]: {
          [label]: claimableAmount,
          usd: claimableAmount * this.prices[label.toLowerCase()],
        },
      };
    }, {});
  }

  get claimableAmountUsd(): number {
    return Object.values(this.claimableAmounts).reduce(
      (previous, current) => previous + current.usd,
      0,
    );
  }

  get claims(): ClaimProofTuple[] {
    return this.tokenClaims
      .map((claim) => claim.claims)
      .reduce((previous, current) => [...previous, ...current]);
  }
}
