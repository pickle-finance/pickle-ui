import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useWeb3React } from "@web3-react/core";
import { config } from "./config";
import { Provider as MulticallProvider } from "ethers-multicall";
import { useRouter } from "next/router";

type Network = ethers.providers.Network;

function useConnection() {
  const { account, library, chainId } = useWeb3React();
  const router = useRouter();

  const [
    multicallProvider,
    setMulticallProvider,
  ] = useState<MulticallProvider | null>(null);

  const [network, setNetwork] = useState<Network | null>(null);
  const [blockNum, setBlockNum] = useState<number | null>(null);

  const switchChainParams : any[] = [];
  switchChainParams[137] = {
    chainId: "0x89",
    chainName: "Polygon",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com/"],
  };
  
  const switchChain = async (chainId: number) => {
    let method: string;
    let params: any[];
    if( chainId === 1 ) {
      method = "wallet_switchEthereumChain";
      params = [{chainId: "0x1"}];
    } else {
      method = "wallet_addEthereumChain";
      const param = switchChainParams[chainId];
      if( param === undefined || param === null )
        return false;
      params = [param];
    }

    try {
      await library.provider.request({
        method: method,
        params: params,
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  // create observable to stream new blocks
  useEffect(() => {
    if (library) {
      library.getNetwork().then((network: any) => setNetwork(network));

      const _multicallProvider = new MulticallProvider(library);
      _multicallProvider
        .init()
        .then(() => setMulticallProvider(_multicallProvider));

      const { ethereum } = window;
      ethereum?.on("chainChanged", () => router.reload());

      const observable = new Observable<number>((subscriber) => {
        library.on("block", (blockNumber: number) =>
          subscriber.next(blockNumber),
        );
      });

      // debounce to prevent subscribers making unnecessary calls
      observable.pipe(debounceTime(1000)).subscribe((blockNumber) => {
        if (blockNumber > (blockNum || 0) + (chainId == 1 ? 3 : 5)) {
          setBlockNum(blockNumber);
        }
      });
    } else {
      setMulticallProvider(null);
      setBlockNum(null);
    }
  }, [library]);

  const chainName = (chainId && config.chains[chainId].name) || null;

  return {
    multicallProvider,
    provider: library,
    address: account,
    network,
    blockNum,
    signer: library?.getSigner(),
    chainId,
    chainName,
    switchChain,
  };
}

export const Connection = createContainer(useConnection);
