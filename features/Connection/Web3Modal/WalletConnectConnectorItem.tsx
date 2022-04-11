import { useTranslation } from "next-i18next";
import { FC, useEffect } from "react";
import ConnectorItem from "./ConnectorItem";
import { initializeConnector } from "@web3-react/core";
import { WalletConnect } from "@web3-react/walletconnect";
import { URLS } from "../../../hooks/chains";


interface ConnectorItemProps {
  onClick: Function;
  ethereum: any;
}

export const [walletConnect, hooks] = initializeConnector<WalletConnect>(
    (actions) =>
      new WalletConnect(actions, {
        rpc: URLS,
      }),
    Object.keys(URLS).map((chainId) => Number(chainId)),
  );
console.log(URLS)

const {
  useChainId,
  useAccounts,
  useError,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
} = hooks;

const WalletConnectItem: FC<ConnectorItemProps> = ({ onClick, ethereum }) => {
  const { t } = useTranslation("common");

  const icon = "walletconnect.svg";
  const title = t("connection.walletConnect");

  const chainId = useChainId();
  const accounts = useAccounts();
  const error = useError();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  // attempt to connect eagerly on mount
  useEffect(() => {
    void walletConnect.connectEagerly();
  }, []);

  return (
    <ConnectorItem
      icon={icon}
      disabled={title === t("connection.walletConnect") && !ethereum}
      title={title}
      loading={isActivating}
      onClick={
        () =>
          onClick(
            walletConnect,
            error,
            isActivating,
            isActive,
          ) /* (web3connector, hooks, hooks.useError(), hooks.useIsActivating(),hooks.useIsActive(),hooks.useProvider()) */
      }
      connector={walletConnect}
      hooks={hooks}
    />
  );
};
export default WalletConnectItem;
