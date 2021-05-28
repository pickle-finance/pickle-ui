import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { providers } from "@0xsequence/multicall";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useWeb3React } from "@web3-react/core";
import { config, ChainName } from "./config";
import { Provider } from "@ethersproject/providers";

type Network = ethers.providers.Network;

function useConnection() {
  const { account, library, chainId } = useWeb3React();
  const [ethInfuraProvider] = useState<Provider>(
    new ethers.providers.JsonRpcProvider(process.env.ethRPC) as any,
  );
  const [polygonInfuraProvider] = useState<Provider>(
    new ethers.providers.JsonRpcProvider(process.env.polygonRPC) as any,
  );

  const [
    multicallProvider,
    setMulticallProvider,
  ] = useState<providers.MulticallProvider | null>(null);
  const [ethMulticallProvider] = useState(
    new providers.MulticallProvider(ethInfuraProvider, {
      timeWindow: 0,
      batchSize: 100,
    }),
  );
  const [polygonMulticallProvider] = useState(
    new providers.MulticallProvider(polygonInfuraProvider, {
      timeWindow: 0,
      batchSize: 100,
    }),
  );

  const [network, setNetwork] = useState<Network | null>(null);
  const [blockNum, setBlockNum] = useState<number | null>(null);

  const switchChain = async (chainId: number) => {
    if (chainId !== 137) return false;

    try {
      await library.provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x89",
            chainName: "Polygon",
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            rpcUrls: ["https://rpc-mainnet.maticvigil.com/"],
            blockExplorerUrls: ["https://explorer-mainnet.maticvigil.com/"],
          },
        ],
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

  const chainName = chainId && config.chains[chainId].name || null;

  const getMCProvider = (chainName: ChainName) => {
    switch (chainName) {
      case "Ethereum":
        return multicallProvider || ethMulticallProvider;
      case "Polygon":
        return multicallProvider || polygonMulticallProvider;
      default:
        return multicallProvider;
    }
  };

  return {
    multicallProvider: getMCProvider(chainName),
    provider: library,
    address: account,
    network,
    blockNum,
    signer: library?.getSigner(),
    chainId,
    chainName,
    switchChain
  };
}

export const Connection = createContainer(useConnection);