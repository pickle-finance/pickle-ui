import { useState, useEffect } from "react";
import ConnectorItem from "./ConnectorItem";
import { FC } from "react";
import type { providers } from "ethers";
import { Modal, Grid, Button } from "@geist-ui/react";
import { useWeb3React } from "@web3-react/core";
import { useTranslation } from "next-i18next";

import { injected, walletconnect, walletlink, cloverconnect } from "./Connectors";
import { useEagerConnect, useInactiveListener } from "./useEagerConnect";
import { PickleCore } from "v1/containers/Jars/usePickleCore";
import { ChainNetwork, Chains, RawChain } from "picklefinance-core/lib/chain/Chains";
import { chainToChainParams } from "v1/containers/Connection";

interface Web3ModalProps {
  setVisible: Function;
}

const Web3Modal: FC<Web3ModalProps> = ({ setVisible, ...rest }) => {
  const { t } = useTranslation("common");
  const { pickleCore } = PickleCore.useContainer();

  const rawChainFor = (network: ChainNetwork): RawChain | undefined => {
    return pickleCore === undefined || pickleCore === null
      ? undefined
      : pickleCore.chains.find((z) => z.network === network);
  };
  const networks = Chains.list().filter((x) => rawChainFor(x) !== undefined);
  const supportedChains = networks.map((x) => {
    const rawChain = rawChainFor(x);
    return chainToChainParams(rawChain);
  });

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
    {
      icon: "clover.svg",
      title: t("connection.clover"),
      connector: cloverconnect,
    },
  ];
  const [activatingConnector, setActivatingConnector] = useState();
  const [ethereum, setEthereum] = useState();
  const [isSupportedChain, setIsSupportedChain] = useState<boolean>(true);
  const { connector, activate, deactivate, error, account, chainId } = useWeb3React<
    providers.Web3Provider
  >();

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
      if (connectedChain == 1 || supportedChains[connectedChain]) {
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
        ) : (
          <div>
            <h1>{t("connection.unsupportedNetwork")}</h1>
            <ul>
              {supportedChains.map((chain) => (
                <h2>- {chain?.chainName}.</h2>
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
