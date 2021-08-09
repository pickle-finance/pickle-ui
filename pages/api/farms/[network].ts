import type { NextApiRequest, NextApiResponse } from "next";
import { ethers, BigNumber } from "ethers";
import { Contract as MulticallContract, Provider } from "ethers-multicall";

import { Minichef__factory } from "containers/Contracts/factories/Minichef__factory";
import { Masterchef__factory } from "containers/Contracts/factories/Masterchef__factory";
import { MINICHEF } from "containers/Contracts";
import { MASTERCHEF_ADDR } from "containers/Contracts";

interface Farm {
  poolIndex: number;
  lpToken: string;
  allocPoint: number;
}

interface PoolInfo {
  0: BigNumber;
  1: BigNumber;
  2: BigNumber;
  allocPoint: BigNumber;
  lastRewardTime: BigNumber;
  lpToken?: string;
}

type Response = Farm[];
type Network = "ethereum" | "polygon";

const contractFactory = (network: Network) => {
  if (network === "ethereum")
    return new MulticallContract(MASTERCHEF_ADDR, Masterchef__factory.abi);

  return new MulticallContract(MINICHEF, Minichef__factory.abi);
};

const providerFactory = (network: Network) => {
  const name = network === "ethereum" ? "homestead" : "matic";

  const infuraProvider = new ethers.providers.InfuraProvider(
    name,
    process.env.INFURA_KEY,
  );

  if (network === "ethereum") return new Provider(infuraProvider, 1);

  return new Provider(infuraProvider, 137);
};

const fetchData = async (network: Network): Promise<Response> => {
  const contract = contractFactory(network);
  const provider = providerFactory(network);

  const [poolLength] = await provider.all<BigNumber[]>([contract.poolLength()]);

  const poolInfo = await provider.all<PoolInfo[]>(
    [...Array(poolLength.toNumber())].map((_, poolIndex) =>
      contract.poolInfo(poolIndex),
    ),
  );

  let lpTokens: string[];
  if (!poolInfo[0].lpToken) {
    lpTokens = await provider.all<string[]>(
      poolInfo.map((_, poolIndex) => contract.lpToken(poolIndex)),
    );
  }

  return poolInfo.map((pool, index) => ({
    poolIndex: index,
    lpToken: pool.lpToken || lpTokens[index],
    allocPoint: pool.allocPoint.toNumber(),
  }));
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { network } = req.query;

  const data = await fetchData(network as Network);

  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=45");
  res.status(200).json(data);
};
