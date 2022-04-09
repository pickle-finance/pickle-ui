import { useState, useEffect } from "react";
import { useWeb3React, Web3ReactHooks } from "@web3-react/core";

// import { injected } from "./Connectors";
import { Connector } from "@web3-react/types";

export function useEagerConnect(connector:Connector, hooks:Web3ReactHooks|undefined) {
  const { isActive } = useWeb3React();
  console.log("useEagerConnect")
  if(!hooks){
    console.log("[useEagerConnect] no hooks");
    return
  }
  // const active = hooks.useIsActive();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    connector.connectEagerly&&connector.connectEagerly();
    setTried(true);
    // injected.isAuthorized().then((isAuthorized) => {
    //   if (isAuthorized) {
    //     activate(injected, undefined, true).catch(() => {
    //     });
    //   } else {
    //     setTried(true);
    //   }
    // });
  }, [/* activate */]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && isActive) {
      setTried(true);
    }
  }, [tried, isActive]);

  return tried;
}

export function useInactiveListener(connector: Connector, hooks: Web3ReactHooks|undefined,suppress = false) {
  const { isActive, error } = useWeb3React();
  if(!hooks){
    console.log("[useInactiveListener] no hooks");
    return
  }
  // const active = hooks.useIsActive();
  // const error = hooks.useError();

  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum) return;
    if (ethereum && ethereum.on && !isActive && !error && !suppress) {
      const handleConnect = () => {
        connector.activate();
      };
      const handleChainChanged = () => {
        connector.activate();
      };
      const handleAccountsChanged = (accounts:string[]) => {
        if (accounts.length > 0) {
          connector.activate();
        }
      };
      const handleNetworkChanged = () => {
        connector.activate();
      };

      ethereum.on("connect", handleConnect);
      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("networkChanged", handleNetworkChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("connect", handleConnect);
          ethereum.removeListener("chainChanged", handleChainChanged);
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("networkChanged", handleNetworkChanged);
        }
      };
    }
  }, [isActive, error, suppress, /* activate */]);
}
