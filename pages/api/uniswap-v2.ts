import type { NextApiRequest, NextApiResponse } from "next";

import { JAR_DEPOSIT_TOKENS } from "../../containers/Jars/jars";
import { PICKLE_ETH_FARM } from "../../containers/Farms/farms";
import { NETWORK_NAMES } from "containers/config";

export interface Record {
  pairAddress: string;
  reserveUSD: number;
  dailyVolumeUSD: number;
}

export interface Response {
  data: {
    pairDayDatas: Record[];
  };
}

const UNI_LP_TOKENS = [
  PICKLE_ETH_FARM,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_ETH_DAI,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_ETH_USDC,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_ETH_USDT,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_ETH_WBTC,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MIR_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MTSLA_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MAAPL_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MQQQ_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MSLV_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_MBABA_UST,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_FEI_TRIBE,
  JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV2_LUSD_ETH,
];

const fetchData = async () => {
  const query = `
  {
    pairDayDatas(
      first: ${UNI_LP_TOKENS.length}
      skip: 1
      orderBy: date
      orderDirection: desc
      where: {
        pairAddress_in: [
          ${UNI_LP_TOKENS.map((address) => `"${address}"`).join(", ")}
        ]
      }
    ) {
      pairAddress
      reserveUSD
      dailyVolumeUSD
    }
  }
  `;

  const res = await fetch(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    {
      headers: {
        "Content-Type": "application/json",
      },
      referrer: "https://thegraph.com/explorer/subgraph/uniswap/uniswap-v2",
      body: JSON.stringify({ query }),
      method: "POST",
      mode: "cors",
    },
  );

  return await res.json();
};

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  const data: Response = await fetchData();

  /**
   * Cache for 5 seconds, then revalidate _in the background_ if requested within
   * the consecutive 55 seconds.
   */
  res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=55");
  res.status(200).json(data);
};
