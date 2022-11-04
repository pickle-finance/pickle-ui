import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import type { Web3Provider } from "@ethersproject/providers";

import { ConnectionSelectors } from "v2/store/connection";
import { ConnectionType, metaMask } from "./connectors";
import { Connector } from "@web3-react/types";

async function connect(connector: Connector) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`);
  }
}

export function useEagerConnect() {
  const { isActive } = useWeb3React();
  const [tried, setTried] = useState(false);
  const isManuallyDeactivated = useSelector(ConnectionSelectors.selectIsManuallyDeactivated);

  useEffect(() => {
    if (!isActive && !isManuallyDeactivated) {
      connect(metaMask);
      setTried(true);
    }

    // Wait until we get confirmation of a connection to flip the flag
    if (isActive) {
      setTried(true);
    }
  }, [isActive]);

  return tried;
}

export const useENS = (
  address: string | null | undefined,
  provider: Web3Provider | undefined,
  chainId: number | undefined,
) => {
  const [ensName, setENSName] = useState<string | null>(null);

  useEffect(() => {
    if (!provider || !address) return;

    const resolveENS = async () => {
      if (ethers.utils.isAddress(address) && chainId === 1) {
        let ensName = await provider.lookupAddress(address);
        if (ensName) setENSName(ensName);
      }
    };

    resolveENS();
  }, [address, provider, chainId]);

  return ensName;
};
