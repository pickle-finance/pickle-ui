import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";

import { injected } from "./connectors";

export function useEagerConnect() {
  const { activate, active } = useWeb3React();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!active) {
      injected.isAuthorized().then((isAuthorized) => {
        if (isAuthorized) {
          // Prevent a race condition on window load by putting activation
          // into the event loop, see https://github.com/NoahZinsmeister/web3-react/issues/78#issuecomment-937923978
          setTimeout(
            () =>
              activate(injected, undefined, true).catch(() => {
                setTried(true);
              }),
            100,
          );
        } else {
          setTried(true);
        }
      });
    }
  }, [active]);

  // Wait until we get confirmation of a connection to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  return tried;
}

/**
 * Triggered when none of the MM accounts are connected.
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React();

  useEffect(() => {
    const { ethereum } = window as any;

    if (ethereum?.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        activate(injected, undefined, true).catch((error) => {
          console.error("Failed to activate after chain changed", error);
        });
      };

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          activate(injected, undefined, true).catch((error) => {
            console.error("Failed to activate after accounts changed", error);
          });
        }
      };

      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("chainChanged", handleChainChanged);
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }

    return undefined;
  }, [active, error, suppress, activate]);
}
