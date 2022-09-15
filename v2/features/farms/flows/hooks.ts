import { useMemo, useState } from "react";
import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useMachine } from "@xstate/react";
import { ethers } from "ethers";
import { RawChain, ChainNetwork } from "picklefinance-core/lib/chain/Chains";
import { AssetProtocol } from "picklefinance-core/lib/model/PickleModelJson";

// TODO: use pf-core files when they're included in the distribution
import { Erc20__factory as Erc20Factory } from "v1/containers/Contracts/factories/Erc20__factory";
import { Erc20 } from "v1/containers/Contracts/Erc20";
import { Gauge__factory as GaugeFactory } from "v1/containers/Contracts/factories/Gauge__factory";
import { Gauge } from "v1/containers/Contracts/Gauge";
import { Minichef__factory as MinichefFactory } from "v1/containers/Contracts/factories/Minichef__factory";
import { Minichef } from "v1/containers/Contracts/Minichef";
import { Jar__factory as JarFactory } from "v1/containers/Contracts/factories/Jar__factory";
import { JarV3__factory as JarV3Factory } from "v1/containers/Contracts/factories/JarV3__factory";
import { Jar } from "v1/containers/Contracts/Jar";
import { JarV3 } from "v1/containers/Contracts/JarV3";
import { VefxsVault } from "v1/containers/Contracts/VefxsVault";
import { VefxsVault__factory as VefxsVaultFactory } from "v1/containers/Contracts/factories/VefxsVault__factory";
import { UniswapRouter__factory as UniswapRouterFactory } from "v1/containers/Contracts/factories";
import { UniswapRouter } from "v1/containers/Contracts/UniswapRouter";
import { PickleZapV1__factory as PickleZapFactory } from "v1/containers/Contracts/factories/";
import { PickleZapV1 } from "v1/containers/Contracts/PickleZapV1";

import { AppDispatch, useAppDispatch, useAppSelector } from "v2/store";
import { Actions } from "./stateMachineUserInput";
import { ThemeActions } from "v2/store/theme";
import { CoreSelectors } from "v2/store/core";

export const useTokenContract = (address: string) => {
  const { library } = useWeb3React<Web3Provider>();

  const TokenContract = useMemo<Erc20 | undefined>(() => {
    if (!library) return;

    return Erc20Factory.connect(address, library.getSigner());
  }, [library, address]);

  return TokenContract;
};

export const useJarContract = (address: string) => {
  const { library } = useWeb3React<Web3Provider>();

  const JarContract = useMemo<Jar | undefined>(() => {
    if (!library) return;

    return JarFactory.connect(address, library.getSigner());
  }, [library, address]);

  return JarContract;
};

export const useFarmContract = (address: string | undefined, chain: RawChain | undefined) => {
  const { library } = useWeb3React<Web3Provider>();

  const FarmContract = useMemo<Gauge | Minichef | undefined>(() => {
    if (!library || !chain || !address) return;

    const Contract = chain.network === ChainNetwork.Ethereum ? GaugeFactory : MinichefFactory;

    return Contract.connect(address, library.getSigner());
  }, [library, address, chain]);

  return FarmContract;
};

export const useZapContracts = (
  chain: ChainNetwork | undefined,
  protocol: AssetProtocol | undefined,
) => {
  const { library } = useWeb3React<Web3Provider>();
  const core = useAppSelector(CoreSelectors.selectCore);

  const swapProtocol = core?.xykSwapProtocols.find((x) => {
    return x.protocol == protocol && x.chain == chain;
  });

  const UniV2Router = useMemo<UniswapRouter | undefined>(() => {
    if (!library || !chain || !protocol || !core || !swapProtocol?.router) return;

    return UniswapRouterFactory.connect(swapProtocol?.router!, library.getSigner());
  }, [library, chain, protocol]);

  const ZapContract = useMemo<PickleZapV1 | undefined>(() => {
    if (!library || !chain || !protocol || !core || !swapProtocol?.router) return;

    return PickleZapFactory.connect(swapProtocol?.pickleZapAddress!, library.getSigner());
  }, [library, chain, protocol]);

  return { UniV2Router, ZapContract };
};

export const usePveContract = (address: string | undefined) => {
  const { library } = useWeb3React<Web3Provider>();

  const PveContract = useMemo<VefxsVault | undefined>(() => {
    if (!library || !address) return;

    return VefxsVaultFactory.connect(address, library.getSigner());
  }, [library, address]);

  return PveContract;
};

export const useUniV3JarContract = (address: string) => {
  const { library } = useWeb3React<Web3Provider>();

  const JarContract = useMemo<JarV3 | undefined>(() => {
    if (!library) return;

    return JarV3Factory.connect(address, library.getSigner());
  }, [library, address]);

  return JarContract;
};

export const useTransaction = (
  transactionFactory: (() => Promise<ethers.ContractTransaction>) | undefined,
  callback: (receipt: ethers.ContractReceipt, dispatch: AppDispatch) => void,
  send: ReturnType<typeof useMachine>[1],
  showConfetti: boolean = false,
) => {
  const [error, setError] = useState<Error | undefined>();
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const sendTransaction = async () => {
    console.log("here");
    if (!transactionFactory) return;

    setError(undefined);
    setIsWaiting(true);

    try {
      const tx = await transactionFactory();
      console.log(tx);

      send(Actions.TRANSACTION_SENT, { txHash: tx.hash });

      tx.wait()
        .then(
          (receipt) => {
            callback(receipt, dispatch);
            send(Actions.SUCCESS);

            if (showConfetti) dispatch(ThemeActions.setIsConfettiOn(true));
          },
          () => send(Actions.FAILURE),
        )
        .finally(() => setIsWaiting(false));
    } catch (error) {
      setError(error as Error);
      setIsWaiting(false);
    }
  };

  return { sendTransaction, error, setError, isWaiting };
};
