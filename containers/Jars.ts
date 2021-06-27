import { useEffect } from "react";
import { createContainer } from "unstated-next";

import { Balances } from "./Balances";
import { Connection } from "./Connection";
import { useFetchJars } from "./Jars/useFetchJars";
import { useJarWithAPY as useJarsWithAPYEth } from "./Jars/useJarsWithAPYEth";
import { useJarWithAPY as useJarsWithAPYPoly } from "./Jars/useJarsWithAPYPoly";

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

  const { addTokens } = Balances.useContainer();

  // Automatically update balance here
  useEffect(() => {
    if (jarsWithTVL) {
      const wants = jarsWithTVL.map((x) => x.depositToken.address);
      const pTokens = jarsWithTVL.map((x) => x.contract.address);
      addTokens([...wants, ...pTokens]);
    }
  }, [jarsWithTVL]);

  return { jars: jarsWithTVL };
}

export const Jars = createContainer(useJars);
