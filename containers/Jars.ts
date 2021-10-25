import { useEffect } from "react";
import { createContainer } from "unstated-next";

import { Balances } from "./Balances";
import { Connection } from "./Connection";
import { useFetchJars } from "./Jars/useFetchJars";
import { useJarWithAPY as useJarsWithAPYEth } from "./Jars/useJarsWithAPYEth";
import { useJarWithAPY as useJarsWithAPYPoly } from "./Jars/useJarsWithAPYPoly";
import { useJarWithAPY as useJarsWithAPYOK } from "./Jars/useJarsWithAPYOK";
import { useJarWithAPY as useJarsWithAPYArb } from "./Jars/useJarsWithAPYArb";
import { useJarWithTVL } from "./Jars/useJarsWithTVL";
import { BPAddresses } from "./config";
import { PICKLE_ETH_SLP } from "./Contracts";
import { NETWORK_NAMES } from "./config";
import { isUniV3, uniV3Info } from "util/univ3";

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
        .filter((y) => !isUniV3(y.depositToken.address.toLowerCase()))
        .map((x) => x.depositToken.address);
      const pTokens = jarsWithTVL.map((x) => x.contract.address);
      const uniV3Underlying = Object.keys(uniV3Info)
        .map((pool) => [uniV3Info[pool].token0, uniV3Info[pool].token1])
        .flat();
      const addedTokens = [...wants, ...pTokens, ...uniV3Underlying];
      if (chainName === NETWORK_NAMES.ETH)
        addedTokens.push(PICKLE_ETH_SLP, BPAddresses.LUSD, BPAddresses.pBAMM);
      addTokens(addedTokens);
    }
  }, [jarsWithTVL]);

  return { jars: jarsWithTVL };
}

export const Jars = createContainer(useJars);
