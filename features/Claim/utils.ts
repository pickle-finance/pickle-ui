import { Signer } from "ethers";

import { BalancerRedeemer__factory as BalancerRedeemerFactory } from "containers/Contracts/factories/BalancerRedeemer__factory";
import config from "./config";

export type Token = keyof typeof config;

interface Snapshot {
  [address: string]: string;
}

interface ClaimsByWeek {
  [week: string]: Snapshot;
}

interface AmountsByWeek {
  [week: string]: number;
}

interface ClaimStatusByWeek {
  [week: string]: boolean;
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
  Object.values(amountsByWeek).reduce((a, b) => a + b, 0);

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
    if (claims[address]) result[week] = parseFloat(claims[address]);
  }

  return result;
};
