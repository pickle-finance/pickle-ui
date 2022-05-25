import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useWeb3React } from "@web3-react/core";
import { Provider as MulticallProvider, setMulticallAddress } from "ethers-multicall";
import { useRouter } from "next/router";
import { ChainNetwork, Chains, RawChain } from "picklefinance-core/lib/chain/Chains";
import { PickleCore } from "./Jars/usePickleCore";

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

export const chainToChainParams = (
  chain: RawChain | undefined,
): AddEthereumChainParameter | undefined => {
  if (!chain) return undefined;
  return {
    chainId: "0x" + chain.chainId.toString(16),
    chainName: chain.networkVisible,
    nativeCurrency: {
      name: chain.gasTokenSymbol.toUpperCase(),
      symbol: chain.gasTokenSymbol.toUpperCase(),
      decimals: 18,
    },
    rpcUrls: chain.rpcs,
    blockExplorerUrls: [chain.explorer],
  };
};

function useConnection() {
  const { account, library, chainId } = useWeb3React();
  const router = useRouter();
  const { pickleCore } = PickleCore.useContainer();

  // Turn off ethersjs warnings
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

  const [multicallProvider, setMulticallProvider] = useState<MulticallProvider | null>(null);

  const [network, setNetwork] = useState<Network | null>(null);
  const [blockNum, setBlockNum] = useState<number | null>(null);

  const switchChain = async (chainId: number) => {
    if (!pickleCore) return false;
    let method: string;
    let params: any[];
    if (chainId === 1) {
      method = "wallet_switchEthereumChain";
      params = [{ chainId: "0x1" }];
    } else {
      method = "wallet_addEthereumChain";
      method = "wallet_addEthereumChain";
      const param = chainToChainParams(pickleCore.chains.find((x) => x.chainId === chainId));
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

  const rawChainFor = (network: ChainNetwork): RawChain | undefined => {
    return pickleCore === undefined || pickleCore === null
      ? undefined
      : pickleCore.chains.find((z) => z.network === network);
  };
  const networks = Chains.list().filter((x) => rawChainFor(x) !== undefined);
  const supportedChainParams = networks.map((x) => {
    const rawChain = rawChainFor(x);
    return chainToChainParams(rawChain);
  });
  const supportedChains = supportedChainParams;

  // create observable to stream new blocks
  useEffect(() => {
    if (library) {
      library.getNetwork().then((network: any) => setNetwork(network));
      Chains.list().map((x) => {
        const raw: RawChain | undefined = rawChainFor(x);
        if (raw && raw.multicallAddress) {
          setMulticallAddress(raw.chainId, raw.multicallAddress);
        }
      });

      const _multicallProvider = new MulticallProvider(library);
      _multicallProvider.init().then(() => setMulticallProvider(_multicallProvider));

      const { ethereum } = window as any;
      ethereum?.on("chainChanged", () => router.reload());

      const observable = new Observable<number>((subscriber) => {
        library.on("block", (blockNumber: number) => subscriber.next(blockNumber));
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
  }, [library, pickleCore]);

  const chainName = pickleCore?.chains.find((x) => x.chainId === chainId)?.network || null;

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
