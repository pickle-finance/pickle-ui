import { FC, useEffect, PropsWithChildren } from "react";
import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from "@web3-react/core";
import { useSelector } from "react-redux";

import { useEagerConnect, useInactiveListener } from "v2/features/connection/hooks";
import { connectorsAndHooks, injected } from "v2/features/connection/connectors";
import { ConnectionSelectors } from "v2/store/connection";

// const AppWeb3Provider: FC<PropsWithChildren> = ({ children }) => {
//   const { active, error, activate, library } = useWeb3React<Web3Provider>();
//   const isManuallyDeactivated = useSelector(ConnectionSelectors.selectIsManuallyDeactivated);

//   // Try to eagerly connect to an injected provider, if it exists and has granted access already
//   const triedEager = useEagerConnect();

//   // After eagerly trying injected, if the network connect ever isn't active or in an error state, activate it
//   // but only if the user hasn't manually deactivated the connection (clicked Exit)
//   useEffect(() => {
//     if (triedEager && !error && !active && !isManuallyDeactivated) {
//       activate(injected);
//     }
//   }, [triedEager, error, active]);

//   // When there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
//   useInactiveListener(!triedEager);

//   return <>{children}</>;
// };

const Provider: FC<PropsWithChildren> = ({ children }) => (
  <Web3ReactProvider connectors={connectorsAndHooks}>{children}</Web3ReactProvider>
);

export default Provider;
