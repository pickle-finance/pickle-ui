import { useEffect } from "react";
import { createContainer } from "unstated-next";

import { Balances } from "./Balances";
import { Connection } from "./Connection";
import { useFetchJars } from "./Jars/useFetchJars";
import { useJarWithAPY as useJarsWithAPYPFCore } from "./Jars/useJarsWithAPYPFCore";
import { useJarWithTVL } from "./Jars/useJarsWithTVL";
import { BPAddresses } from "./config";
import { PICKLE_ETH_SLP } from "./Contracts";
import { PickleCore } from "./Jars/usePickleCore";
import { AssetProtocol } from "picklefinance-core/lib/model/PickleModelJson";
import { ChainNetwork } from "picklefinance-core";

function useJars() {
  const { chainName } = Connection.useContainer();
  const { jars: rawJars } = useFetchJars();
  const { jarsWithAPY } = useJarsWithAPYPFCore(chainName, rawJars);
  const { jarsWithTVL } = useJarWithTVL(jarsWithAPY);
  const { pickleCore } = PickleCore.useContainer();

  const { addTokens } = Balances.useContainer();

  // Automatically update balance here
  useEffect(() => {
    if (jarsWithTVL && chainName) {
      const wants = jarsWithTVL
        .filter((x) => x?.isErc20 && x.protocol != AssetProtocol.UNISWAP_V3)
        .map((x) => x.depositToken.address);
      const pTokens = jarsWithTVL.map((x) => x.contract.address);

      const uniV3Jars = pickleCore?.assets.jars.filter(
        (x) => x.protocol === AssetProtocol.UNISWAP_V3 && x.chain === chainName,
      );
      const uniV3Underlying = uniV3Jars
        ?.map((x) => x.depositToken.componentAddresses)
        .flat()
        .filter((x) => x);
      const addedTokens = [...wants, ...pTokens, ...uniV3Underlying];

      if (chainName === ChainNetwork.Ethereum)
        addedTokens.push(PICKLE_ETH_SLP, BPAddresses.LUSD, BPAddresses.pBAMM);
      addTokens(addedTokens);
    }
  }, [jarsWithTVL]);

  return { jars: jarsWithTVL };
}

export const Jars = createContainer(useJars);
