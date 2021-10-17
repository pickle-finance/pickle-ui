import { Signer } from "ethers";

import { BalancerRedeemer__factory as BalancerRedeemerFactory } from "containers/Contracts/factories/BalancerRedeemer__factory";

const pickleRedeemer = "0xe3Fb4f33FDb4ECC874a842c5ca2Ee6a2E547328c";
const balRedeemer = "0x6bd0B17713aaa29A2d7c9A39dDc120114f9fD809";

export type Token = "PICKLE" | "BAL";

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
  const url =
    token === "PICKLE"
      ? "https://raw.githubusercontent.com/balancer-labs/bal-mining-scripts/master/reports/_current-pickle-arbitrum.json"
      : "https://raw.githubusercontent.com/balancer-labs/bal-mining-scripts/master/reports/_current-arbitrum.json";

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
  const contractAddress = token === "PICKLE" ? pickleRedeemer : balRedeemer;
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
