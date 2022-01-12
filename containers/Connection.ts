import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useWeb3React } from "@web3-react/core";
import { config } from "./config";
import {
  Provider as MulticallProvider,
  setMulticallAddress,
} from "ethers-multicall";
import { useRouter } from "next/router";

type Network = ethers.providers.Network;

// See https://eips.ethereum.org/EIPS/eip-3085 and
// https://docs.metamask.io/guide/rpc-api.html#wallet-addethereumchain
interface AddEthereumChainParameter {
  chainId: string;
  blockExplorerUrls?: string[];
  chainName?: string;
  iconUrls?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls?: string[];
}

function useConnection() {
  const { account, library, chainId } = useWeb3React();
  const router = useRouter();

  const [
    multicallProvider,
    setMulticallProvider,
  ] = useState<MulticallProvider | null>(null);

  const [network, setNetwork] = useState<Network | null>(null);
  const [blockNum, setBlockNum] = useState<number | null>(null);

  const switchChainParams: AddEthereumChainParameter[] = [];

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

  switchChainParams[66] = {
    chainId: "0x42",
    chainName: "OKEx Chain",
    nativeCurrency: {
      name: "OKT",
      symbol: "OKT",
      decimals: 18,
    },
    rpcUrls: ["https://exchainrpc.okex.org"],
    blockExplorerUrls: ["https://www.oklink.com/okexchain/"],
  };

  switchChainParams[42161] = {
    chainId: "0xA4B1",
    chainName: "Arbitrum",
    nativeCurrency: {
      name: "AETH",
      symbol: "AETH",
      decimals: 18,
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io/"],
  };

  switchChainParams[1285] = {
    chainId: "0x505",
    chainName: "Moonriver",
    nativeCurrency: {
      name: "MOVR",
      symbol: "MOVR",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.moonriver.moonbeam.network"],
    blockExplorerUrls: ["https://moonriver.moonscan.io/"],
  };

  switchChainParams[25] = {
    chainId: "0x19",
    chainName: "Cronos",
    nativeCurrency: {
      name: "CRO",
      symbol: "CRO",
      decimals: 18,
    },
    rpcUrls: ["https://evm-cronos.crypto.org"],
    blockExplorerUrls: ["https://cronos.crypto.org/explorer/"],
  };

  switchChainParams[1313161554] = {
    chainId: "0x4E454152",
    chainName: "Aurora",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.aurora.dev"],
    blockExplorerUrls: ["https://explorer.mainnet.aurora.dev/"],
  };

  const switchChain = async (chainId: number) => {
    let method: string;
    let params: any[];
    if (chainId === 1) {
      method = "wallet_switchEthereumChain";
      params = [{ chainId: "0x1" }];
    } else {
      method = "wallet_addEthereumChain";
      const param = switchChainParams[chainId];
      if (param === undefined || param === null) return false;
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

  const supportedChains = switchChainParams;

  // create observable to stream new blocks
  useEffect(() => {
    if (library) {
      library.getNetwork().then((network: any) => setNetwork(network));

      setMulticallAddress(66, "0x94fEadE0D3D832E4A05d459eBeA9350c6cDd3bCa");
      setMulticallAddress(42161, "0x813715eF627B01f4931d8C6F8D2459F26E19137E");
      setMulticallAddress(1285, "0x4c4a5d20f1ee40eaacb6a7787d20d16b7997363b");
      setMulticallAddress(25, "0x0fA4d452693F2f45D28c4EC4d20b236C4010dA74");
      setMulticallAddress(
        1313161554,
        "0x60Ad579Fb20c8896b7b98E800cBA9e196E6eaA44",
      );

      const _multicallProvider = new MulticallProvider(library);
      _multicallProvider
        .init()
        .then(() => setMulticallProvider(_multicallProvider));

      const { ethereum } = window as any;
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
    supportedChains,
  };
}

export const Connection = createContainer(useConnection);
