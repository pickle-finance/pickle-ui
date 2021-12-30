import arbitrum from "public/arbitrum.svg";
import aurora from "public/aurora.svg";
import ethereum from "public/ethereum.svg";
import oec from "public/oec.svg";
import matic from "public/matic.svg";
import moonriver from "public/moonriver.svg";

type Network = {
  name: string;
  icon: any;
  chainId: number;
};

export const networks: Network[] = [
  {
    name: "Arbitrum",
    icon: arbitrum,
    chainId: 42161,
  },
  {
    name: "Aurora",
    icon: aurora,
    chainId: 1313161554,
  },
  {
    name: "Ethereum",
    icon: ethereum,
    chainId: 1,
  },
  {
    name: "Moonriver",
    icon: moonriver,
    chainId: 1285,
  },
  {
    name: "OEC",
    icon: oec,
    chainId: 66,
  },
  {
    name: "Polygon",
    icon: matic,
    chainId: 137,
  },
];
