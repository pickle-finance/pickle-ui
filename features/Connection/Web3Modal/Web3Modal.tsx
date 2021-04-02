import { useState, useEffect } from "react";
import ConnectorItem from "./ConnectorItem";
import styled from "styled-components";
import { FC } from "react";
import {
  injected,
  walletconnect,
  portis,
  walletlink,
  fortmatic,
} from "./Connectors";
import { Modal, Grid } from "@geist-ui/react";
import { useWeb3React } from "@web3-react/core";

interface Web3ModalProps {
  setVisible: Function;
}

const Web3Modal: FC<Web3ModalProps> = ({ setVisible, ...rest }) => {
  const itemList = [
    {
      icon: "metamask.svg",
      title: "Metamask",
      connector: injected,
    },
    {
      icon: "walletconnect.svg",
      title: "Wallet Connect",
      connector: walletconnect,
    },
    {
      icon: "portis.svg",
      title: "Portis",
      connector: portis,
    },
    {
      icon: "coinbase.svg",
      title: "Coinbase",
      connector: walletlink,
    },
    {
      icon: "fortmatic.svg",
      title: "Fortmatic",
      connector: fortmatic,
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
  } = useWeb3React();

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
      if (connector && connector.walletConnectProvider) {
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

  return (
    <Modal width="500px" {...rest}>
      <Modal.Title>Connect Wallet</Modal.Title>
      <Modal.Content>
        <Grid.Container gap={2}>
          {itemList.map(({ icon, title, connector: web3connector }, index) => {
            const currentConnector = web3connector;
            const activating = currentConnector === activatingConnector;
            const connected = currentConnector === connector;
            return (
              <Grid xs={12} key={index}>
                <ConnectorItem
                  icon={icon}
                  disabled={title === "Metamask" && !ethereum}
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
