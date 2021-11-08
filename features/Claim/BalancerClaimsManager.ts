import { Signer, ContractTransaction } from "ethers";

import { tokenClaimInfoList, merkleOrchardAddress } from "./config";
import { Prices, ClaimableAmounts, ClaimProof } from "./types";
import { BalancerTokenClaim } from "./BalancerTokenClaim";
import { BalancerMerkleOrchard__factory as MerkleOrchardFactory } from "containers/Contracts/factories/BalancerMerkleOrchard__factory";

export class BalancerClaimsManager {
  private tokens: string[] = [];
  private tokenClaims: BalancerTokenClaim[] = [];

  constructor(
    private address: string,
    private signer: Signer,
    private prices: Prices,
  ) {}

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

  claimDistributions = async (): Promise<ContractTransaction> => {
    const merkleOrchard = MerkleOrchardFactory.connect(
      merkleOrchardAddress,
      this.signer,
    );

    return merkleOrchard.claimDistributions(
      this.address,
      this.claims,
      this.tokens,
    );
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

  private get claims(): ClaimProof[] {
    return this.tokenClaims
      .map((claim) => claim.claims)
      .reduce((previous, current) => [...previous, ...current]);
  }
}
