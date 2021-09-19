import { useState, useEffect } from "react";
import ConnectorItem from "./ConnectorItem";
import { FC } from "react";
import type { providers } from "ethers";
import { Modal, Grid } from "@geist-ui/react";
import { useWeb3React } from "@web3-react/core";
import { useTranslation } from "next-i18next";

import { injected, walletconnect, walletlink } from "./Connectors";
import { useEagerConnect, useInactiveListener } from "./useEagerConnect";

interface Web3ModalProps {
  setVisible: Function;
}

const Web3Modal: FC<Web3ModalProps> = ({ setVisible, ...rest }) => {
  const { t } = useTranslation("common");

  const itemList = [
    {
      icon: "metamask.svg",
      title: t("connection.metamask"),
      connector: injected,
    },
    {
      icon: "walletconnect.svg",
      title: t("connection.walletConnect"),
      connector: walletconnect,
    },
    {
      icon: "coinbase.svg",
      title: t("connection.coinbase"),
      connector: walletlink,
    },
  ];
  const [activatingConnector, setActivatingConnector] = useState();
  const [ethereum, setEthereum] = useState();
  const {
    connector,
    activate,
    deactivate,
    error,
    account,
    chainId,
  } = useWeb3React<providers.Web3Provider>();

  useEffect(() => {
    if (chainId && chainId !== 1) {
      deactivate();
    }
  }, [chainId, deactivate]);

  const onConnectClick = (web3connector: any) => {
    if (connector === web3connector) {
      deactivate();
    } else {
      setActivatingConnector(web3connector);
      activate(web3connector);
      setVisible(false);
    }
  };

  useEffect(() => {
    if (account) setVisible(false);
  }, [account, setVisible]);

  useEffect(() => {
    if (activatingConnector && error) {
      if (connector?.walletConnectProvider) {
        connector.walletConnectProvider = undefined;
      }
      deactivate();
    }
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector, setVisible, deactivate, error]);

  useEffect(() => {
    const { ethereum } = window;
    setEthereum(ethereum);
  }, []);

  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager || !!activatingConnector);

  return (
    <Modal width="500px" {...rest}>
      <Modal.Title>{t("connection.connect")}</Modal.Title>
      <Modal.Content>
        <Grid.Container gap={2}>
          {itemList.map(({ icon, title, connector: web3connector }, index) => {
            const currentConnector = web3connector;
            const activating = currentConnector === activatingConnector;

            return (
              <Grid xs={12} key={index}>
                <ConnectorItem
                  icon={icon}
                  disabled={title === t("connection.metamask") && !ethereum}
                  title={title}
                  loading={activating}
                  onClick={() => onConnectClick(web3connector)}
                />
              </Grid>
            );
          })}
        </Grid.Container>
      </Modal.Content>
    </Modal>
  );
};

export default Web3Modal;
