import { Signer } from "ethers";
import { toWei, soliditySha3 } from "web3-utils";

import { BalancerRedeemer__factory as BalancerRedeemerFactory } from "containers/Contracts/factories/BalancerRedeemer__factory";
import config from "./config";
import MerkleTree from "./MerkleTree";

export type Token = keyof typeof config;

interface Snapshot {
  [address: string]: string;
}

interface ClaimsByWeek {
  [week: string]: Snapshot;
}

interface AmountsByWeek {
  [week: string]: string;
}

interface ClaimStatusByWeek {
  [week: string]: boolean;
}

interface Claim {
  week: number;
  balance: string;
  merkleProof: string[];
}

export class BalancerRedeemer {
  /**
   * All the data we have fetched from IPFS in the
   * following format:
   * {
   *   [weekNumber]: {
   *     [address1]: "balance1",
   *     [address2]: "balance2"
   *   }
   * }
   */
  public claimsByWeek: ClaimsByWeek = {};

  /**
   * Specific amounts (values) we can claim for this signer
   * for specific weeks (keys).
   * E.g. { 2: "7", 3: "9" }
   */
  public unclaimedAmounts: AmountsByWeek = {};

  constructor(
    private token: Token,
    private address: string,
    private signer: Signer,
  ) {}

  fetchData = async (): Promise<void> => {
    const snapshot = await this.getSnapshot();
    this.claimsByWeek = await this.getClaimsByWeek(snapshot);

    const claimStatusByWeek = await this.getClaimStatusByWeek();
    this.unclaimedAmounts = await this.getUnclaimedAmountsByWeek(
      claimStatusByWeek,
    );
  };

  get claimableAmount(): number {
    return Object.values(this.unclaimedAmounts).reduce(
      (a, b) => a + parseFloat(b),
      0,
    );
  }

  get claimableWeeks(): string[] {
    return Object.keys(this.unclaimedAmounts);
  }

  generateClaim = (week: string): Claim => {
    const weeklyBalances = this.claimsByWeek[week];
    const balance = weeklyBalances[this.address];
    const merkleTree = this.generateMerkleTree(week);
    const proof = merkleTree.getHexProof(
      soliditySha3(this.address, toWei(balance))!,
    );

    return {
      week: parseInt(week),
      balance: toWei(balance),
      merkleProof: proof,
    };
  };

  verifyClaim = async (claim: Claim): Promise<boolean> => {
    const contractAddress = config[this.token].contract;
    const contract = BalancerRedeemerFactory.connect(
      contractAddress,
      this.signer,
    );

    return await contract.verifyClaim(
      this.address,
      claim.week,
      claim.balance,
      claim.merkleProof,
    );
  };

  // E.g. { 2: "7", 3: "9" }
  private getUnclaimedAmountsByWeek = async (
    claimStatusByWeek: ClaimStatusByWeek,
  ): Promise<AmountsByWeek> => {
    const result: AmountsByWeek = {};

    for (const [week, claims] of Object.entries(this.claimsByWeek)) {
      // Already claimed, skip.
      if (claimStatusByWeek[week]) continue;

      // Anything to claim?
      if (claims[this.address]) result[week] = claims[this.address];
    }

    return result;
  };

  // E.g. { 1: true, 2: false, 3: false }
  private getClaimStatusByWeek = async (): Promise<ClaimStatusByWeek> => {
    const weeks = Object.keys(this.claimsByWeek);
    const contractAddress = config[this.token].contract;
    const contract = BalancerRedeemerFactory.connect(
      contractAddress,
      this.signer,
    );
    const statuses = await contract.claimStatus(
      this.address,
      1,
      parseInt(weeks[weeks.length - 1]),
    );

    return Object.fromEntries(statuses.map((status, i) => [i + 1, status]));
  };

  private getClaimsByWeek = async (
    snapshot: Snapshot,
  ): Promise<ClaimsByWeek> => {
    const claimsByWeek: ClaimsByWeek = {};

    for (const [week, hash] of Object.entries(snapshot)) {
      claimsByWeek[week] = await this.fetchFromIpfs(hash);
    }

    return claimsByWeek;
  };

  private getSnapshot = async (): Promise<Snapshot> => {
    const url = config[this.token].url;
    const snapshot = await fetch(url);

    return await snapshot.json();
  };

  private fetchFromIpfs = async (hash: string): Promise<Snapshot> => {
    const url = `https://ipfs.io/ipfs/${hash}`;
    const res = await fetch(url);

    return await res.json();
  };

  private generateMerkleTree = (week: string): MerkleTree => {
    const balances = this.claimsByWeek[week];
    const elements = Object.keys(balances).map((address) => {
      const balance = toWei(balances[address]);

      return soliditySha3(address, balance)!;
    });

    return new MerkleTree(elements);
  };
}
