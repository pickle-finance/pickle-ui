import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { Provider as MulticallProvider } from "ethers-multicall";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useWeb3React } from "@web3-react/core";

type Provider = ethers.providers.Provider;
type Network = ethers.providers.Network;

function useConnection() {
  const { account, library } = useWeb3React();

  const [
    multicallProvider,
    setMulticallProvider,
  ] = useState<MulticallProvider | null>(null);

  const [provider, setProvider] = useState<Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null | undefined>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [blockNum, setBlockNum] = useState<number | null>(null);

  // create observable to stream new blocks
  useEffect(() => {
    if (library) {
      setProvider(library);
      setAddress(account);

      setSigner(library.getSigner());
      library.getNetwork().then((network: any) => setNetwork(network));

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
    }
  }, [library]);

  return {
    multicallProvider,
    provider,
    address,
    network,
    blockNum,
    signer,
  };
}

export const Connection = createContainer(useConnection);
