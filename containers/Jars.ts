import { useEffect } from "react";
import { createContainer } from "unstated-next";

import { Balances } from "./Balances";
import { Connection } from "./Connection";
import { useFetchJars } from "./Jars/useFetchJars";
import { useJarWithAPY as useJarsWithAPYPFCore } from "./Jars/useJarsWithAPYPFCore";
import { useJarWithTVL } from "./Jars/useJarsWithTVL";
import { BPAddresses } from "./config";
import { PICKLE_ETH_SLP } from "./Contracts";
import { NETWORK_NAMES } from "./config";

function useJars() {
  const { chainName } = Connection.useContainer();
  const { jars: rawJars } = useFetchJars();  const { jarsWithAPY: jarsWithAPYPFCore } = useJarsWithAPYPFCore(chainName, rawJars);
  const { jarsWithTVL } = useJarWithTVL( jarsWithAPYPFCore );
  const { addTokens } = Balances.useContainer();

  // Automatically update balance here
  useEffect(() => {
    if (jarsWithTVL) {
      const wants = jarsWithTVL.map((x) => x.depositToken.address);
      const pTokens = jarsWithTVL.map((x) => x.contract.address);
      const addedTokens = [...wants, ...pTokens];
      if (chainName === NETWORK_NAMES.ETH)
        addedTokens.push(PICKLE_ETH_SLP, BPAddresses.LUSD, BPAddresses.pBAMM);
      addTokens(addedTokens);
    }
  }, [jarsWithTVL]);

  return { jars: jarsWithTVL };
}

export const Jars = createContainer(useJars);
