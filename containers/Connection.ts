import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useWeb3React, Web3ReactHooks, getPriorityConnector } from "@web3-react/core";
import { Provider as MulticallProvider, setMulticallAddress } from "ethers-multicall";
import { useRouter } from "next/router";
import { ChainNetwork, Chains, RawChain } from "picklefinance-core/lib/chain/Chains";
import { PickleCore } from "./Jars/usePickleCore";
import { AddEthereumChainParameter, Connector } from "@web3-react/types";
import { getHooks } from "features/Connection/Web3Modal/Connectors";
import { MetaMask } from "@web3-react/metamask";
import { WalletConnect } from "@web3-react/walletconnect";
import { CoinbaseWallet } from "@web3-react/coinbase-wallet";

type Network = ethers.providers.Network;

// See https://eips.ethereum.org/EIPS/eip-3085 and
// https://docs.metamask.io/guide/rpc-api.html#wallet-addethereumchain
// interface AddEthereumChainParameter {
//   chainId: string;
//   blockExplorerUrls?: string[];
//   chainName?: string;
//   iconUrls?: string[];
//   nativeCurrency?: {
//     name: string;
//     symbol: string;
//     decimals: number;
//   };
//   rpcUrls?: string[];
// }

export const chainToChainParams = (
  chain: RawChain | undefined,
): AddEthereumChainParameter | undefined => {
  if (!chain) return undefined;
  return {
    chainId: chain.chainId,
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
  const {
    account,
    /* library, */ chainId,
    /* provider, */ connector,
    isActive,
    ENSName,
  } = useWeb3React();
  const router = useRouter();
  const { pickleCore } = PickleCore.useContainer();

  // Turn off ethersjs warnings
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

  const [multicallProvider, setMulticallProvider] = useState<MulticallProvider | null>(null);

  const [hooks, setHooks] = useState<Web3ReactHooks>();
  const [provider, setProvider] = useState<ReturnType<Web3ReactHooks["useProvider"]>>();
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();

  const [network, setNetwork] = useState<Network | null>(null);
  const [blockNum, setBlockNum] = useState<number | null>(null);

  const switchChain = async (desiredChainId: number) => {
    // if pfcore is not loaded yet, return
    if (!pickleCore) return false;
    // if we're already connected to the desired chain, return
    if (desiredChainId === chainId) return true;
    // if they want to connect to the default chain and we're already connected, return
    if (desiredChainId === -1 && chainId !== undefined) return true;

    try {
      if (connector instanceof WalletConnect /* || connector instanceof Network */) {
        await connector.activate(desiredChainId === -1 ? undefined : desiredChainId);
      } else {
        await connector.activate(
          desiredChainId === -1 ? undefined : chainToChainParams(rawChainFor(desiredChainId)),
        );
      }
      return true;
    } catch (e) {
      console.log("switchChainError");
      console.log(e);
    }
    return false;
  };

  // const rawChainFor = (network: ChainNetwork): RawChain | undefined => {
  //   return pickleCore === undefined || pickleCore === null
  //     ? undefined
  //     : pickleCore.chains.find((z) => z.network === network);
  // };
  const rawChainFor = (network: ChainNetwork | number): RawChain | undefined => {
    return pickleCore === undefined || pickleCore === null
      ? undefined
      : pickleCore.chains.find((z) => z.network === network || z.chainId === network);
  };

  const networks = Chains.list().filter((x) => rawChainFor(x) !== undefined);
  const supportedChainParams = networks.map((x) => {
    const rawChain = rawChainFor(x);
    return chainToChainParams(rawChain);
  });
  const supportedChains = supportedChainParams;

  // get the currently connected connector hooks & provider
  const currentHooks = getHooks(connector);
  // hooks provider gives back a signer, the useWeb3React provider does not!
  const currentProvider = currentHooks?.useProvider();

  // useEffect(() => {
  //   if (connector && tryHooks && tryProvider) {
  //     const signer = tryProvider.getSigner();

  //     setProvider(tryProvider);
  //     setSigner(signer);
  //     setHooks(hooks);
  //   }
  // }, [account, chainId, connector]);

  // create observable to stream new blocks
  useEffect(() => {
    // update provider, hooks and signer each time provider changes (upon chain, account or connector changes)
    if (pickleCore && currentHooks && currentProvider && currentProvider !== provider) {
      // set the network
      currentProvider.getNetwork().then((network: any) => setNetwork(network));

      // set multicall address
      Chains.list().map((x) => {
        const raw: RawChain | undefined = rawChainFor(x);
        if (raw && raw.multicallAddress) {
          setMulticallAddress(raw.chainId, raw.multicallAddress);
        }
      });

      // set multicallProvider
      const _multicallProvider = new MulticallProvider(currentProvider, chainId);
      setMulticallProvider(_multicallProvider);

      // reload the page on chain changes
      const { ethereum } = window as any;
      ethereum?.on("chainChanged", () => router.reload());

      // create an observable to track the latest chain blocks
      const observable = new Observable<number>((subscriber) => {
        currentProvider.on("block", (blockNumber: number) => subscriber.next(blockNumber));
      });

      // debounce to prevent subscribers making unnecessary calls
      observable.pipe(debounceTime(1000)).subscribe((blockNumber) => {
        if (blockNumber > (blockNum || 0) + (chainId == 1 ? 3 : 5)) {
          setBlockNum(blockNumber);
        }
      });

      setProvider(currentProvider);
      setHooks(currentHooks);
      setSigner(currentProvider.getSigner());
    }
  }, [pickleCore, connector, provider, chainId, account]);

  const chainName = pickleCore?.chains.find((x) => x.chainId === chainId)?.network || null;

  return {
    multicallProvider,
    provider,
    address: account,
    network,
    blockNum,
    chainId,
    chainName,
    switchChain,
    supportedChains,
    connector,
    hooks,
    signer,
  };
}

export const Connection = createContainer(useConnection);
