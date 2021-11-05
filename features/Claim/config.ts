import { ethers } from "ethers";
import {
  Contract as MulticallContract,
  Provider,
  setMulticallAddress,
} from "ethers-multicall";

import { TokenClaimInfo } from "./types";
import { BalancerMerkleOrchard__factory as MerkleOrchardFactory } from "containers/Contracts/factories/BalancerMerkleOrchard__factory";

export const merkleOrchardAddress =
  "0x751A0bC0e3f75b38e01Cf25bFCE7fF36DE1C87DE";

setMulticallAddress(42161, "0x813715eF627B01f4931d8C6F8D2459F26E19137E");
const provider = new ethers.providers.JsonRpcProvider(
  "https://arb1.arbitrum.io/rpc",
);
export const multicallProvider = new Provider(provider, 42161);
export const multicallContract = new MulticallContract(
  merkleOrchardAddress,
  MerkleOrchardFactory.abi,
);

export const tokenClaimInfoList: TokenClaimInfo[] = [
  {
    label: "BAL",
    distributor: "0xd2EB7Bd802A7CA68d9AcD209bEc4E664A9abDD7b",
    token: "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8",
    manifest:
      "https://raw.githubusercontent.com/balancer-labs/bal-mining-scripts/master/reports/_current-arbitrum.json",
    weekStart: 6,
  },
];
