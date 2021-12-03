import { useEffect, useState } from "react";
import { Connection } from "../Connection";
import { NETWORK_NAMES } from "containers/config";
import { PickleCore } from "./usePickleCore";

export interface UniLPAPY {
  pair: {
    id: string;
  };
  reserveUSD: number;
  volumeUSD: number;
}

const headers = {
  "User-Agent":
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.5",
  "Content-Type": "application/json",
};

export const useSushiPairDayData = () => {
  const { chainName } = Connection.useContainer();
  const { pickleCore } = PickleCore.useContainer();

  interface SushiLpAddresses {
    eth: string[];
    arb: string[];
    poly: string[];
  }

  const [sushiPairDayData, setSushiPairDayData] = useState<Array<UniLPAPY>>([]);
  const [sushiLpTokens, setSushiLpTokens] = useState<SushiLpAddresses>();

  const fillSushiLpTokens = () => {
    const eth: string[] = [];
    const poly: string[] = [];
    const arb: string[] = [];
    pickleCore?.assets.jars.forEach((x) => {
      if (x.protocol === "sushiswap") {
        eth.push(x.depositToken.addr);
      }
      if (x.protocol === "sushiswap_polygon") {
        poly.push(x.depositToken.addr);
      }
      if (x.protocol === "sushiswap_arbitrum") {
        arb.push(x.depositToken.addr);
      }
    });
    pickleCore?.assets.standaloneFarms.forEach((x) => {
      if (x.protocol === "sushiswap") {
        eth.push(x.depositToken.addr);
      }
      if (x.protocol === "sushiswap_polygon") {
        poly.push(x.depositToken.addr);
      }
      if (x.protocol === "sushiswap_arbitrum") {
        arb.push(x.depositToken.addr);
      }
    });
    pickleCore?.assets.external.forEach((x) => {
      if (x.protocol === "sushiswap") {
        eth.push(x.depositToken.addr);
      }
      if (x.protocol === "sushiswap_polygon") {
        poly.push(x.depositToken.addr);
      }
      if (x.protocol === "sushiswap_arbitrum") {
        arb.push(x.depositToken.addr);
      }
    });

    setSushiLpTokens({
      eth: eth,
      poly: poly,
      arb: arb,
    });
  };

  const queryTheGraph = () => {
    fetch("https://api.thegraph.com/subgraphs/name/sushiswap/exchange", {
      credentials: "omit",
      headers,
      referrer:
        "https://thegraph.com/explorer/subgraph/zippoxer/sushiswap-subgraph-fork",
      body: `{"query":"{\\n  pairDayDatas(first: ${
        sushiLpTokens?.eth.length
      }, skip: 1, orderBy: date, orderDirection: desc, where: {pair_in: [\\"${sushiLpTokens?.eth
        .join('\\", \\"')
        .toLowerCase()}\\"]}) {\\n    pair{ id }\\n    reserveUSD\\n    volumeUSD\\n  }\\n}\\n","variables":null}`,
      method: "POST",
      mode: "cors",
    })
      .then((res) => res.json())
      .then((data) => setSushiPairDayData(data.data?.pairDayDatas))
      .catch(() => setSushiPairDayData([]));
  };

  const queryTheGraphArb = () => {
    fetch(
      "https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange",
      {
        credentials: "omit",
        headers,
        referrer:
          "https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange",
        body: `{"query":"{\\n  pairDayDatas(first: ${
          sushiLpTokens?.arb.length
        }, skip: 1, orderBy: date, orderDirection: desc, where: {pair_in: [\\"${sushiLpTokens?.arb
          .join('\\", \\"')
          .toLowerCase()}\\"]}) {\\n    pair{ id }\\n    reserveUSD\\n    volumeUSD\\n  }\\n}\\n","variables":null}`,
        method: "POST",
        mode: "cors",
      },
    )
      .then((res) => res.json())
      .then((data) => setSushiPairDayData(data.data?.pairDayDatas))
      .catch(() => setSushiPairDayData([]));
  };

  const queryTheGraphPoly = () => {
    fetch("https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange", {
      credentials: "omit",
      headers,
      referrer:
        "https://thegraph.com/explorer/subgraph/sushiswap/matic-exchange",
      body: `{"query":"{\\n  pairDayDatas(first: ${
        sushiLpTokens?.poly.length
      }, skip: 1, orderBy: date, orderDirection: desc, where: {pair_in: [\\"${sushiLpTokens?.poly
        .join('\\", \\"')
        .toLowerCase()}\\"]}) {\\n    pair{ id }\\n    reserveUSD\\n    volumeUSD\\n  }\\n}\\n","variables":null}`,
      method: "POST",
      mode: "cors",
    })
      .then((res) => res.json())
      .then((data) => setSushiPairDayData(data.data?.pairDayDatas))
      .catch(() => setSushiPairDayData([]));
  };

  const getSushiPairDayAPY = (pair: string) => {
    if (sushiPairDayData) {
      const filteredPair = sushiPairDayData.filter((x) => {
        const pairAddress = x?.pair?.id;
        return pairAddress.toLowerCase() === pair.toLowerCase();
      });

      if (filteredPair.length > 0) {
        const selected = filteredPair[0];

        // 0.25% fee to LP
        const apy =
          (selected.volumeUSD / selected.reserveUSD) * 0.0025 * 365 * 100;

        return [{ lp: apy }];
      }
    }

    return [];
  };

  useEffect(() => {
    if (sushiPairDayData.length > 0) return;

    if (!sushiLpTokens) {
      fillSushiLpTokens();
    }

    if (sushiLpTokens) {
      if (chainName === NETWORK_NAMES.POLY) {
        queryTheGraphPoly();
      } else if (chainName === NETWORK_NAMES.ARB) {
        queryTheGraphArb();
      } else {
        queryTheGraph();
      }
    }
  });

  return {
    getSushiPairDayAPY,
    sushiPairDayData,
  };
};
