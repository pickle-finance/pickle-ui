import { FC } from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import {
  useEagerConnect,
  useInactiveListener,
} from "v2/features/connection/hooks";

const getLibrary = (provider: any) => new Web3Provider(provider);

const AppWeb3Provider: FC = ({ children }) => {
  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager);

  return <>{children}</>;
};

const Provider: FC = ({ children }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <AppWeb3Provider>{children}</AppWeb3Provider>
  </Web3ReactProvider>
);

export default Provider;
