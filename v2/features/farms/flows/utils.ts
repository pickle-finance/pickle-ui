import { ethers, Event } from "ethers";

export const eventsByName = <T extends Event>(receipt: ethers.ContractReceipt, name: string): T[] =>
  receipt.events?.filter(({ event }) => event === name) as T[];
