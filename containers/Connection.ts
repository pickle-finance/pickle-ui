import { useState, useEffect } from "react";
import { createContainer } from "unstated-next";
import { ethers } from "ethers";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { useWeb3React, Web3ReactHooks } from "@web3-react/core";
import {
  Provider as MulticallProvider,
  setMulticallAddress,
} from "ethers-multicall";
import { useRouter } from "next/router";
import { ChainNetwork, Chains, RawChain } from "picklefinance-core/lib/chain/Chains";
import { PickleCore } from "./Jars/usePickleCore";
import { AddEthereumChainParameter } from "@web3-react/types";
import { getHooks } from "features/Connection/Web3Modal/Connectors";

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
  const { account, /* library, */ chainId, provider, connector } = useWeb3React();
  const router = useRouter();
  const { pickleCore } = PickleCore.useContainer();

  // Turn off ethersjs warnings
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

  const [multicallProvider, setMulticallProvider] = useState<MulticallProvider | null>(null);

  const [ hooks, setHooks ] = useState<Web3ReactHooks>();

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
      // TODO
      // await library.provider.request({
      //   method: method,
      //   params: params,
      // });
      await connector.activate(chainToChainParams(rawChainFor(chainId)));
      setHooks(getHooks(connector));
      return true;
    } catch (e) {
      return false;
    }
  };

  // const rawChainFor = (network: ChainNetwork): RawChain | undefined => {
  //   return pickleCore === undefined || pickleCore === null
  //     ? undefined
  //     : pickleCore.chains.find((z) => z.network === network);
  // };
  const rawChainFor = (network: ChainNetwork|number): RawChain | undefined => {
    return pickleCore === undefined || pickleCore === null
      ? undefined
      : pickleCore.chains.find((z) => (z.network === network || z.chainId === network));
  };

  const networks = Chains.list().filter((x) => rawChainFor(x) !== undefined);
  const supportedChainParams = networks.map((x) => {
    const rawChain = rawChainFor(x);
    return chainToChainParams(rawChain);
  });
  const supportedChains = supportedChainParams;

  // create observable to stream new blocks
  useEffect(() => {
    if (provider) {
      provider.getNetwork().then((network: any) => setNetwork(network));
      Chains.list().map((x) => {
        const raw: RawChain | undefined = rawChainFor(x);
        if (raw && raw.multicallAddress) {
          setMulticallAddress(raw.chainId, raw.multicallAddress);
        }
      });

      const _multicallProvider = new MulticallProvider(provider);
      _multicallProvider
        .init()
        .then(() => setMulticallProvider(_multicallProvider));

      const { ethereum } = window as any;
      ethereum?.on("chainChanged", () => router.reload());

      const observable = new Observable<number>((subscriber) => {
        provider.on("block", (blockNumber: number) =>
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
  }, [provider, pickleCore]);

  const chainName = pickleCore?.chains.find((x) => x.chainId === chainId)?.network || null;

  return {
    multicallProvider,
    provider,
    address: account,
    network,
    blockNum,
    // signer: library?.getSigner(),  // TODO 
    chainId,
    chainName,
    switchChain,
    supportedChains,
    connector,
    hooks,
    signer: hooks?.useProvider()?.getSigner(),
  };
}

export const Connection = createContainer(useConnection);
