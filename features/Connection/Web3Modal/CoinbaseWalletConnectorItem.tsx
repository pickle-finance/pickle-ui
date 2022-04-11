import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { initializeConnector } from "@web3-react/core";
import { useTranslation } from "next-i18next";
import { FC, useEffect } from "react";
import { URLS } from "../../../hooks/chains";
import ConnectorItem from "./ConnectorItem";

interface ConnectorItemProps {
  onClick: Function;
  ethereum: any;
}

export const [coinbaseWallet, hooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet(actions, {
      url: URLS[1][0],
      appName: "web3-react",
    //   appLogoUrl: "/pickle.png",
    }),
);

const {
  useChainId,
  useAccounts,
  useError,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
} = hooks;

const CoinbaseWalletItem: FC<ConnectorItemProps> = ({ onClick, ethereum }) => {
  const { t } = useTranslation("common");

  const icon = "coinbase.svg";
  const title = t("connection.coinbase");

  const chainId = useChainId();
  const accounts = useAccounts();
  const error = useError();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  // attempt to connect eagerly on mount
  useEffect(() => {
    void coinbaseWallet.connectEagerly();
  }, []);

  return (
    <ConnectorItem
      icon={icon}
      disabled={title === t("connection.coinbase") && !ethereum}
      title={title}
      loading={isActivating}
      onClick={
        () =>
          onClick(
            coinbaseWallet,
            error,
            isActivating,
            isActive,
          ) /* (web3connector, hooks, hooks.useError(), hooks.useIsActivating(),hooks.useIsActive(),hooks.useProvider()) */
      }
      connector={coinbaseWallet}
      hooks={hooks}
    />
  );
};
export default CoinbaseWalletItem;
