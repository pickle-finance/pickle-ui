import { useEffect } from "react";
import { createContainer } from "unstated-next";

import { Balances } from "./Balances";
import { Connection } from "./Connection";
import { useFetchJars } from "./Jars/useFetchJars";
import { useJarWithAPY as useJarsWithAPYPFCore } from "./Jars/useJarsWithAPYPFCore";
import { BPAddresses, FraxAddresses } from "./config";
import { PICKLE_ETH_SLP } from "./Contracts";
import { PickleCore } from "./Jars/usePickleCore";
import { AssetProtocol } from "picklefinance-core/lib/model/PickleModelJson";
import { ChainNetwork } from "picklefinance-core";
import { getComponentTokenAddresses } from "./Jars/useJarsWithUniV3";

function useJars() {
  const { chainName } = Connection.useContainer();
  const { jars: rawJars } = useFetchJars();
  const { jarsWithAPY: jarsWithTVL } = useJarsWithAPYPFCore(chainName, rawJars);
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
      const uniV3Underlying: string[] =
        uniV3Jars === undefined
          ? []
          : uniV3Jars
              .map((x): string[] => {
                const r: string[] | undefined = getComponentTokenAddresses(pickleCore, x);
                if (r === undefined) return [];
                return r as string[];
              })
              .flat()
              .filter((x) => x);
      const addedTokens = [...wants, ...pTokens, ...uniV3Underlying];

      if (chainName === ChainNetwork.Ethereum)
        addedTokens.push(PICKLE_ETH_SLP, BPAddresses.LUSD, BPAddresses.pBAMM, FraxAddresses.FXS);
      addTokens(addedTokens);
    }
  }, [jarsWithTVL]);

  return { jars: jarsWithTVL };
}

export const Jars = createContainer(useJars);
