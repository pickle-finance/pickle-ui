import { useEffect } from "react";
import { createContainer } from "unstated-next";

import { Balances } from "./Balances";
import { Connection } from "./Connection";
import { useFetchJars } from "./Jars-Ethereum/useFetchJars";
import { useJarWithAPY } from "./Jars-Ethereum/useJarsWithAPY";
import { useJarWithTVL } from "./Jars-Ethereum/useJarsWithTVL";
import { jars } from "util/jars";

function useJars() {
  const { chainName } = Connection.useContainer();
  const { jars: rawJars } = useFetchJars();
  const { jarsWithAPY } = useJarWithAPY(chainName, rawJars);
  console.log(jarsWithAPY)
  const { jarsWithTVL } = useJarWithTVL(jarsWithAPY);

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
