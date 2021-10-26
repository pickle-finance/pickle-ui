import { useEffect, useState } from "react";

import { JAR_DEPOSIT_TOKENS } from "./jars";
import { PICKLE_ETH_FARM } from "../Farms/farms";
import { NETWORK_NAMES } from "containers/config";

export interface UniV3Position {
  id: string;
  depositedToken0: number;
  depositedToken1: number;
  pool: {
    id: string;
  };
}

const NFT_IDS = [
  { [JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].UNIV3_RBN_ETH]: "144390" },
];

export const useUniV3Data = () => {
  const [uniV3Data, setUniV3Data] = useState<Array<UniV3Position> | null>(null);

  const queryTheGraph = async () => {
    const res = await fetch(
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
      {
        credentials: "omit",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/json",
        },
        referrer:
          "https://thegraph.com/hosted-service/subgraph/uniswap/uniswap-v3",
        body: `{"query":"{\\n  positions(first: ${NFT_IDS.length.toString()}, orderDirection: desc, where: {id_in: [\\"${NFT_IDS.map(
          (x) => Object.values(x),
        )
          .flat()
          .join(
            '\\", \\"',
          )}\\"]}) {\\n    id\\n    depositedToken0\\n    depositedToken1\\n pool{id}\\n}\\n}\\n","variables":null}`,
        method: "POST",
        mode: "cors",
      },
    ).then((x) => x.json());

    res?.data?.positions && setUniV3Data(res?.data?.positions);
  };

  const getUniV3Data = (pairAddress: string) => {
    if (uniV3Data) {
      const poolData = uniV3Data.find((x) => x.pool.id === pairAddress.toLowerCase());

      if (poolData) {
        return [
          {
            amount0: poolData.depositedToken0,
            amount1: poolData.depositedToken1,
          },
        ];
      }
    }

    return [];
  };

  useEffect(() => {
    queryTheGraph();
  }, []);

  return {
    getUniV3Data,
    uniV3Data,
  };
};
