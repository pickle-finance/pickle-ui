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

const fetchFromIpfs = async (hash: string): Promise<Snapshot> => {
  const url = `https://ipfs.io/ipfs/${hash}`;
  const res = await fetch(url);

  return await res.json();
};

const getSnapshot = async (token: Token): Promise<Snapshot> => {
  const url = config[token].url;
  const snapshot = await fetch(url);

  return await snapshot.json();
};

export const getClaimsByWeek = async (token: Token): Promise<ClaimsByWeek> => {
  const snapshot = await getSnapshot(token);
  const claimsByWeek: ClaimsByWeek = {};

  for (const [week, hash] of Object.entries(snapshot)) {
    claimsByWeek[week] = await fetchFromIpfs(hash);
  }

  return claimsByWeek;
};

const getClaimStatusByWeek = async (
  token: Token,
  claimsByWeek: ClaimsByWeek,
  address: string,
  signer: Signer,
): Promise<ClaimStatusByWeek> => {
  const weeks = Object.keys(claimsByWeek);
  const contractAddress = config[token].contract;
  const contract = BalancerRedeemerFactory.connect(contractAddress, signer);
  const statuses = await contract.claimStatus(
    address,
    1,
    parseInt(weeks[weeks.length - 1]),
  );

  return Object.fromEntries(statuses.map((status, i) => [i + 1, status]));
};

export const getClaimableAmount = (amountsByWeek: AmountsByWeek): number =>
  Object.values(amountsByWeek).reduce((a, b) => a + parseFloat(b), 0);

export const getUnclaimedAmountsByWeek = async (
  token: Token,
  claimsByWeek: ClaimsByWeek,
  address: string,
  signer: Signer,
): Promise<AmountsByWeek> => {
  const claimStatusByWeek = await getClaimStatusByWeek(
    token,
    claimsByWeek,
    address,
    signer,
  );
  const result: AmountsByWeek = {};

  for (const [week, claims] of Object.entries(claimsByWeek)) {
    // Already claimed, skip.
    if (claimStatusByWeek[week]) continue;

    // Anything to claim?
    if (claims[address]) result[week] = claims[address];
  }

  return result;
};

export const generateClaim = (
  merkleTree: MerkleTree,
  week: string,
  balance: string,
  address: string,
): Claim => {
  const proof = merkleTree.getHexProof(soliditySha3(address, toWei(balance))!);

  return {
    week: parseInt(week),
    balance: toWei(balance),
    merkleProof: proof,
  };
};

export const verifyClaim = async (
  claim: Claim,
  address: string,
  token: Token,
  signer: Signer,
): Promise<boolean> => {
  const contractAddress = config[token].contract;
  const contract = BalancerRedeemerFactory.connect(contractAddress, signer);

  return await contract.verifyClaim(
    address,
    claim.week,
    claim.balance,
    claim.merkleProof,
  );
};

export const generateMerkleTree = (balances: Snapshot): MerkleTree => {
  const elements = Object.keys(balances).map((address) => {
    const balance = toWei(balances[address]);

    return soliditySha3(address, balance)!;
  });

  return new MerkleTree(elements);
};
