import { useState, useEffect, useCallback } from "react";
import ConnectorItem from "./ConnectorItem";
import { FC } from "react";
import type { ethers, providers } from "ethers";
import { Modal, Grid, Button } from "@geist-ui/react";
import { useWeb3React, Web3ReactHooks } from "@web3-react/core";
import { useTranslation } from "next-i18next";

// import { /* injected, walletconnect, walletlink, cloverconnect */connectors,getHooks,metaMask,walletConnect } from "./Connectors";

import { hooks as metaMaskHooks, metaMask } from "../../../hooks/connectors/metaMask";
import {
  hooks as walletConnectHooks,
  walletConnect,
} from "../../../hooks/connectors/walletConnect";
import { useEagerConnect, useInactiveListener } from "./useEagerConnect";
import { PickleCore } from "containers/Jars/usePickleCore";
import { ChainNetwork, Chains, RawChain } from "picklefinance-core/lib/chain/Chains";
import { chainToChainParams, Connection } from "containers/Connection";
import { Connector } from "@web3-react/types";
import { WalletConnect } from "@web3-react/walletconnect";
import MetaMaskItem from "./MetaMaskConnectorItem";
import WalletConnectItem from "./WalletConnectConnectorItem";
import CoinbaseWalletItem from "./CoinbaseWalletConnectorItem";

interface Web3ModalProps {
  setVisible: Function;
}

const Web3Modal: FC<Web3ModalProps> = ({ setVisible, ...rest }) => {
  const { t } = useTranslation("common");
  const { pickleCore } = PickleCore.useContainer();

  const rawChainFor = (network: ChainNetwork | number): RawChain | undefined => {
    return pickleCore === undefined || pickleCore === null
      ? undefined
      : pickleCore.chains.find((z) => z.network === network || z.chainId === network);
  };
  const networks = Chains.list().filter((x) => rawChainFor(x) !== undefined);
  const supportedChains = networks.map((x) => {
    const rawChain = rawChainFor(x);
    return chainToChainParams(rawChain);
  });
  // const supportedChains:{[chainId:number]:{}} = {1:{}};

  // const itemList = [
  //   {
  //     icon: "metamask.svg",
  //     title: t("connection.metamask"),
  //     connector: metaMask,
  //     hooks: metaMaskHooks,
  //   },
  //   {
  //     icon: "walletconnect.svg",
  //     title: t("connection.walletConnect"),
  //     connector: walletConnect,
  //     hooks: walletConnectHooks,
  //   },
  //   {
  //     icon: "coinbase.svg",
  //     title: t("connection.coinbase"),
  //     connector: metaMask,
  //     hooks: metaMaskHooks,
  //   },
  //   {
  //     icon: "clover.svg",
  //     title: t("connection.clover"),
  //     connector: metaMask,
  //     hooks: metaMaskHooks,
  //   },
  // ];

  const itemList = [MetaMaskItem,WalletConnectItem,CoinbaseWalletItem];

  // const [activatingConnector, setActivatingConnector] = useState<Connector>();
  const [ethereum, setEthereum] = useState();
  const [isSupportedChain, setIsSupportedChain] = useState<boolean>(true);
  const [desiredChainId, setDesiredChainId] = useState<number>(-1);

  // const {
  //   connector,
  //   // activate,
  //   // deactivate,
  //   error,
  //   account,
  //   chainId,
  // } = useWeb3React();
  const { connector, hooks, address: account, chainId } = Connection.useContainer();

  // useEffect(() => {
  //   if (chainId && chainId !== 1) {
  //     deactivate();
  //   }
  // }, [chainId, deactivate]);

  // const onConnectClick = async (web3connector: Connector) => {
  //   console.log(web3connector)
  //   console.log(connector);
  //   if (connector === web3connector) {
  //     await web3connector.deactivate();
  //     console.log("deacted")
  //   } else {
  //     let connectedChain: number|undefined;
  //     const web3ConnectorHooks = getHooks(web3connector);
  //     connectedChain = web3ConnectorHooks?.useChainId();
  //     if(!connectedChain) console.log("connectedChain: "+ connectedChain);

  //     if (connectedChain !== undefined && rawChainFor(connectedChain)) {
  //       setActivatingConnector(web3connector);
  //       web3connector.activate(chainToChainParams(rawChainFor(connectedChain)));
  //       setVisible(false);
  //     } else {
  //       setIsSupportedChain(false);
  //     }
  //   }
  // };
  const onConnectClick = async (
    conn: Connector,
    // hooks: Web3ReactHooks,
    error: ReturnType<Web3ReactHooks["useError"]>,
    isActivating: ReturnType<Web3ReactHooks["useIsActivating"]>,
    isActive: ReturnType<Web3ReactHooks["useIsActive"]>,
  ) => {
    console.log("inside onConnectClick");
    console.log(conn);
    console.log(error);
    console.log(isActive);

    if (isActive) {
      conn.deactivate();
    } else if (desiredChainId !== -1 && !rawChainFor(desiredChainId)) {
      setIsSupportedChain(false);
    } else if (!isActivating || error) {
      conn instanceof WalletConnect /* || conn instanceof Network */
        ? conn.activate(desiredChainId === -1 ? undefined : desiredChainId)
        : conn.activate(
            desiredChainId === -1 ? undefined : chainToChainParams(rawChainFor(desiredChainId)),
          );
      setVisible(false);
    }

    // if (error) {
    //   conn instanceof WalletConnect /* || conn instanceof Network */
    //     ? void conn.activate(desiredChainId === -1 ? undefined : desiredChainId)
    //     : void conn.activate(
    //         desiredChainId === -1 ? undefined : chainToChainParams(rawChainFor(desiredChainId)),
    //       );
    // } else if (isActive) {
    //   conn.deactivate();
    // } else {
    //   isActivating
    //     ? undefined
    //     : conn instanceof WalletConnect /* || connector instanceof Network */
    //     ? conn.activate(desiredChainId === -1 ? undefined : desiredChainId)
    //     : conn.activate(
    //         desiredChainId === -1 ? undefined : chainToChainParams(rawChainFor(desiredChainId)),
    //       );
    // }
  };

  useEffect(() => {
    if (account) {
      setVisible(false);
      setIsSupportedChain(true);
      console.log(account)
    }
  }, [account, setVisible]);

  // useEffect(() => {
  //   if (activatingConnector && error) {
  //     if (connector?.walletConnectProvider) {
  //       connector.walletConnectProvider = undefined;
  //     }
  //     connector.deactivate();
  //   }
  //   if (activatingConnector && activatingConnector === connector) {
  //     setActivatingConnector(undefined);
  //   }
  // }, [activatingConnector, connector, setVisible, error]);

  useEffect(() => {
    const { ethereum } = window as any;
    setEthereum(ethereum);
    // setDesiredChainId(ethereum.networkVersion);
    setDesiredChainId(+ethereum.chainId);

    console.log(+ethereum.chainId);
  }, []);

  const triedEager = useEagerConnect(connector);
  useInactiveListener(connector, hooks, !triedEager /* || !!activatingConnector */);

  return (
    <Modal width="500px" {...rest}>
      <Modal.Title>{t("connection.connect")}</Modal.Title>
      <Modal.Content>
        {isSupportedChain ? (
          <Grid.Container gap={2}>
            {itemList.map((ConnectorItem, index) => {
              // const currentConnector = web3connector;
              // const activating = /* currentConnector ===  activatingConnector */ hooks.useIsActivating();

              return (
                <Grid xs={12} key={index}>
                  <ConnectorItem onClick={onConnectClick} ethereum={ethereum} />
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
