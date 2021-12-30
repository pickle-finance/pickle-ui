import { FC, useEffect } from "react";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useRouter } from "next/router";

import { useAppDispatch } from "v2/store";
import { updateBlockNumber } from "v2/store/connection";
import {
  useEagerConnect,
  useInactiveListener,
} from "v2/features/connection/hooks";
import { injected } from "v2/features/connection/connectors";

const getLibrary = (provider: any) => new Web3Provider(provider);

const AppWeb3Provider: FC = ({ children }) => {
  const { active, error, activate, library } = useWeb3React<Web3Provider>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // After eagerly trying injected, if the network connect ever isn't active or in an error state, activate it
  useEffect(() => {
    if (triedEager && !active && !error && !active) {
      activate(injected);
    }
  }, [triedEager, error, active]);

  // When there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);

  useEffect(() => {
    if (library) {
      const { ethereum } = window;

      library.on("block", (blockNumber: number) =>
        dispatch(updateBlockNumber(blockNumber)),
      );

      if (ethereum?.on) {
        ethereum.on("chainChanged", router.reload);
      }

      return () => {
        if (ethereum?.removeListener) {
          ethereum.removeListener("chainChanged", router.reload);
        }
        library.removeAllListeners("block");
      };
    }
  }, [library]);

  return <>{children}</>;
};

const Provider: FC = ({ children }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <AppWeb3Provider>{children}</AppWeb3Provider>
  </Web3ReactProvider>
);

export default Provider;
