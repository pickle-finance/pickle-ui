import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import type { providers } from "ethers";
import { Provider as MulticallProvider } from "ethers-multicall";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useWeb3React } from "@web3-react/core";

function useConnection() {
  const { account, library } = useWeb3React<providers.Web3Provider>();

  const [
    multicallProvider,
    setMulticallProvider,
  ] = useState<MulticallProvider | null>(null);

  const [network, setNetwork] = useState<providers.Network | null>(null);
  const [blockNum, setBlockNum] = useState<number | null>(null);

  // create observable to stream new blocks
  useEffect(() => {
    if (library) {
      library.getNetwork().then((network) => setNetwork(network));

      const ethMulticallProvider = new MulticallProvider(library);
      ethMulticallProvider
        .init()
        .then(() => setMulticallProvider(ethMulticallProvider));

      const observable = new Observable<number>((subscriber) => {
        library.on("block", (blockNumber: number) =>
          subscriber.next(blockNumber),
        );
      });

      // debounce to prevent subscribers making unnecessary calls
      observable.pipe(debounceTime(1000)).subscribe((blockNumber) => {
        // Update every 5 blocks otherwise its very laggy
        if (blockNumber > (blockNum || 0) + 5) {
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
  };
}

export const Connection = createContainer(useConnection);
