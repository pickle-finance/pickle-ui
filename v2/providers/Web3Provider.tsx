import { FC, useEffect } from "react";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import {
  useEagerConnect,
  useInactiveListener,
} from "v2/features/connection/hooks";
import { injected } from "v2/features/connection/connectors";

const getLibrary = (provider: any) => new Web3Provider(provider);

const AppWeb3Provider: FC = ({ children }) => {
  const { active, error, activate } = useWeb3React();

  // Try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // After eagerly trying injected, if the network connect ever isn't active or in an error state, activate it
  useEffect(() => {
    if (triedEager && !active && !error && !active) {
      activate(injected);
    }
  }, [triedEager, active, error, active]);

  // When there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);

  return <>{children}</>;
};

const Provider: FC = ({ children }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <AppWeb3Provider>{children}</AppWeb3Provider>
  </Web3ReactProvider>
);

export default Provider;
