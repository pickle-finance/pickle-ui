import { useTranslation } from "next-i18next";
import { FC, useEffect } from "react";
import { hooks, metaMask } from "../../../hooks/connectors/metaMask";
import ConnectorItem from "./ConnectorItem";
// import { Accounts } from '../Accounts'
// import { Card } from '../Card'
// import { Chain } from '../Chain'
// import { ConnectWithSelect } from '../ConnectWithSelect'
// import { Status } from '../Status'
interface MetaMaskCardProps{
    onClick: Function;
    ethereum: any;
}
const {
  useChainId,
  useAccounts,
  useError,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
} = hooks;

 const MetaMaskCard:FC<MetaMaskCardProps> = ({onClick,ethereum}) =>{
  const { t } = useTranslation("common");

  const icon = "metamask.svg";
  const title = t("connection.metamask");

  const chainId = useChainId();
  const accounts = useAccounts();
  const error = useError();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  // attempt to connect eagerly on mount
  useEffect(() => {
    void metaMask.connectEagerly();
  }, []);

  return (
    <ConnectorItem
      icon={icon}
      disabled={title === t("connection.metamask") && !ethereum}
      title={title}
      loading={isActivating}
      onClick={
        () =>
          onClick(metaMask,error,isActivating,isActive,provider, chainId) /* (web3connector, hooks, hooks.useError(), hooks.useIsActivating(),hooks.useIsActive(),hooks.useProvider()) */
      }
      connector={metaMask}
      hooks={hooks}
    />
  );
}
export default MetaMaskCard