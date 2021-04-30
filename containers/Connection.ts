import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { providers } from "@0xsequence/multicall";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useWeb3React } from "@web3-react/core";
import { config } from "./config";

type Network = ethers.providers.Network;

function useConnection() {
  const { account, library, chainId } = useWeb3React();

  const [
    multicallProvider,
    setMulticallProvider,
  ] = useState<providers.MulticallProvider | null>(null);

  const [network, setNetwork] = useState<Network | null>(null);
  const [blockNum, setBlockNum] = useState<number | null>(null);

  // create observable to stream new blocks
  useEffect(() => {
    if (library) {
      library.getNetwork().then((network: any) => setNetwork(network));

      setMulticallProvider(
        new providers.MulticallProvider(library, {
          timeWindow: 0,
          batchSize: 100,
        }),
      );

      const observable = new Observable<number>((subscriber) => {
        library.on("block", (blockNumber: number) =>
          subscriber.next(blockNumber),
        );
      });

      // debounce to prevent subscribers making unnecessary calls
      observable.pipe(debounceTime(1000)).subscribe((blockNumber) => {
        // Update every 5 blocks otherwise its very laggy
        if (blockNumber > (blockNum || 0) + (chainId == 1 ? 5 : 20)) {
          setBlockNum(blockNumber);
        }
      });
    } else {
      setMulticallProvider(null);
      setBlockNum(null);
    }
  }, [library]);

  return {
    multicallProvider,
    provider: library,
    address: account,
    network,
    blockNum,
    signer: library?.getSigner(),
    chainId,
    chainName: chainId && config.chains[chainId].name,
  };
}

export const Connection = createContainer(useConnection);
