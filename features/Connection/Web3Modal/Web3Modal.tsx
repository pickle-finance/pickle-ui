import { useState, useEffect } from "react";
import ConnectorItem from "./ConnectorItem";
import { FC } from "react";
import type { providers } from "ethers";
import { Modal, Grid, Button } from "@geist-ui/react";
import { useWeb3React } from "@web3-react/core";
import { useTranslation } from "next-i18next";

import { injected, walletconnect, walletlink } from "./Connectors";
import { useEagerConnect, useInactiveListener } from "./useEagerConnect";
import { config as supportedChains } from "../../../containers/config";

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
  const [isSupportedChain, setIsSupportedChain] = useState<boolean>(true);
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

  const onConnectClick = async (web3connector: any) => {
    if (connector === web3connector) {
      deactivate();
    } else {
      let connectedChain: number;
      try {
        connectedChain = +(await web3connector.getChainId());
      } catch {
        connectedChain = 1;
      } // Failing assumes a wallet other than MetaMask is used
      if (connectedChain == 1 || supportedChains.chains[connectedChain]) {
        setActivatingConnector(web3connector);
        activate(web3connector);
        setVisible(false);
      } else {
        setIsSupportedChain(false);
      }
    }
  };

  useEffect(() => {
    if (account) {
      setVisible(false);
      setIsSupportedChain(true);
    }
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
    const { ethereum } = window as any;
    setEthereum(ethereum);
  }, []);

  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager || !!activatingConnector);

  return (
    <Modal width="500px" {...rest}>
      <Modal.Title>{t("connection.connect")}</Modal.Title>
      <Modal.Content>
        {isSupportedChain ? (
          <Grid.Container gap={2}>
            {itemList.map(
              ({ icon, title, connector: web3connector }, index) => {
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
              },
            )}
          </Grid.Container>
        ) : (
          <div>
            <h1>{t("connection.unsupportedNetwork")}</h1>
            <ul>
              {Object.keys(supportedChains.chains).map((chain) => (
                <h2>- {supportedChains.chains[+chain].name}.</h2>
              ))}
            </ul>
            <Button
              onClick={() => {
                setVisible(false);
                setIsSupportedChain(true);
              }}
            >
              Close
            </Button>
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
};

export default Web3Modal;
