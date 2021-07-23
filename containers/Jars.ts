import { useEffect } from "react";
import { createContainer } from "unstated-next";

import { Balances } from "./Balances";
import { Connection } from "./Connection";
import { useFetchJars } from "./Jars/useFetchJars";
import { useJarWithAPY as useJarsWithAPYEth } from "./Jars/useJarsWithAPYEth";
import { useJarWithAPY as useJarsWithAPYPoly } from "./Jars/useJarsWithAPYPoly";
import { PICKLE_ETH_SLP } from "./Contracts";

import { useJarWithTVL } from "./Jars/useJarsWithTVL";

function useJars() {
  const { chainName } = Connection.useContainer();
  const { jars: rawJars } = useFetchJars();
  const { jarsWithAPY: jarsWithAPYEth } = useJarsWithAPYEth(chainName, rawJars);
  const { jarsWithAPY: jarsWithAPYPoly } = useJarsWithAPYPoly(
    chainName,
    rawJars,
  );
  const { jarsWithTVL } = useJarWithTVL(jarsWithAPYEth || jarsWithAPYPoly);
  if (jarsWithTVL)
    console.log(
      `Jars successfully (re)loaded, Jar count: ${jarsWithTVL.length}`,
    );
  const { addTokens } = Balances.useContainer();

  // Automatically update balance here
  useEffect(() => {
    if (jarsWithTVL) {
      const wants = jarsWithTVL.map((x) => x.depositToken.address);
      const pTokens = jarsWithTVL.map((x) => x.contract.address);
      addTokens([...wants, ...pTokens, PICKLE_ETH_SLP]);
    }
  }, [jarsWithTVL]);

  return { jars: jarsWithTVL };
}

export const Jars = createContainer(useJars);
