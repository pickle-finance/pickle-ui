import { FC, useEffect, PropsWithChildren } from "react";
import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from "@web3-react/core";
import { useSelector } from "react-redux";

import { useEagerConnect } from "v2/features/connection/hooks";
import { connectorsAndHooks } from "v2/features/connection/connectors";
import { ConnectionSelectors } from "v2/store/connection";

const AppWeb3Provider: FC<PropsWithChildren> = ({ children }) => {
  const isManuallyDeactivated = useSelector(ConnectionSelectors.selectIsManuallyDeactivated);

  // Try to eagerly connect to an injected provider, if it exists and has granted access already
  useEagerConnect();
  return <>{children}</>;
};

const Provider: FC<PropsWithChildren> = ({ children }) => (
  <Web3ReactProvider connectors={connectorsAndHooks}>
    <AppWeb3Provider>{children}</AppWeb3Provider>
  </Web3ReactProvider>
);

export default Provider;
