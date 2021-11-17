import { useEffect } from "react";
import { createContainer } from "unstated-next";

import { Balances } from "./Balances";
import { Connection } from "./Connection";
import { isUniV3, useFetchJars } from "./Jars/useFetchJars";
import { uniV3Info } from "util/univ3";
import { useJarWithAPY as useJarsWithAPYEth } from "./Jars/useJarsWithAPYEth";
import { useJarWithAPY as useJarsWithAPYPoly } from "./Jars/useJarsWithAPYPoly";
import { useJarWithAPY as useJarsWithAPYOK } from "./Jars/useJarsWithAPYOK";
import { useJarWithAPY as useJarsWithAPYArb } from "./Jars/useJarsWithAPYArb";
import { useJarWithTVL } from "./Jars/useJarsWithTVL";
import { BPAddresses, FraxAddresses } from "./config";
import { PICKLE_ETH_SLP } from "./Contracts";
import { NETWORK_NAMES } from "./config";

function useJars() {
  const { chainName } = Connection.useContainer();
  const { jars: rawJars } = useFetchJars();
  const { jarsWithAPY: jarsWithAPYEth } = useJarsWithAPYEth(chainName, rawJars);
  const { jarsWithAPY: jarsWithAPYPoly } = useJarsWithAPYPoly(
    chainName,
    rawJars,
  );
  const { jarsWithAPY: jarswithAPYOK } = useJarsWithAPYOK(chainName, rawJars);
  const { jarsWithAPY: jarswithAPYArb } = useJarsWithAPYArb(chainName, rawJars);

  const { jarsWithTVL } = useJarWithTVL(
    jarsWithAPYEth || jarsWithAPYPoly || jarswithAPYOK || jarswithAPYArb,
  );

  const { addTokens } = Balances.useContainer();

  // Automatically update balance here
  useEffect(() => {
    if (jarsWithTVL) {
      const wants = jarsWithTVL
        .map((x) =>
          isUniV3(x.depositToken.address) ? null : x.depositToken.address,
        )
        .filter((x) => x);
      const pTokens = jarsWithTVL.map((x) => x.contract.address);
      const uniV3Underlying = Object.keys(uniV3Info)
        .map((pool) => [
          uniV3Info[pool as keyof typeof uniV3Info].token0,
          uniV3Info[pool as keyof typeof uniV3Info].token1,
        ])
        .flat();
      const addedTokens = [...wants, ...pTokens, ...uniV3Underlying];
      if (chainName === NETWORK_NAMES.ETH)
        addedTokens.push(PICKLE_ETH_SLP, BPAddresses.LUSD, BPAddresses.pBAMM, FraxAddresses.FXS);
      addTokens(addedTokens);
    }
  }, [jarsWithTVL]);

  return { jars: jarsWithTVL };
}

export const Jars = createContainer(useJars);
