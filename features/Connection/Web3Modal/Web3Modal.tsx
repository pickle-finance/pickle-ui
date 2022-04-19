import { useState, useEffect } from "react";
import ConnectorItem from "./ConnectorItem";
import { FC } from "react";
import { Modal, Grid, Button } from "@geist-ui/react";
import { Web3ReactHooks } from "@web3-react/core";
import { useTranslation } from "next-i18next";
import { connectorItemPropsList, connectorsAndHooks } from "./Connectors";

import { PickleCore } from "containers/Jars/usePickleCore";
import { ChainNetwork, Chains, RawChain } from "picklefinance-core/lib/chain/Chains";
import { chainToChainParams, Connection } from "containers/Connection";
import { Connector } from "@web3-react/types";
import { WalletConnect } from "@web3-react/walletconnect";

interface Web3ModalProps {
  setVisible: Function;
}

const Web3Modal: FC<Web3ModalProps> = ({ setVisible, ...rest }) => {
  const { t } = useTranslation("common");
  const { pickleCore } = PickleCore.useContainer();
  const { address } = Connection.useContainer();

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

  const [ethereum, setEthereum] = useState();
  const [isSupportedChain, setIsSupportedChain] = useState<boolean>(true);
  const [desiredChainId, setDesiredChainId] = useState<number>(-1);
  const [triedEager, setTriedEager] = useState<boolean>();

  const onConnectClick = async (
    conn: Connector,
    error: ReturnType<Web3ReactHooks["useError"]>,
    isActivating: ReturnType<Web3ReactHooks["useIsActivating"]>,
    isActive: ReturnType<Web3ReactHooks["useIsActive"]>,
  ) => {
    if (isActive) {
      conn.deactivate();
    } else if (desiredChainId !== -1 && !rawChainFor(desiredChainId)) {
      setIsSupportedChain(false);
    } else if (!isActivating || error) {
      conn instanceof WalletConnect
        ? conn.activate(desiredChainId === -1 ? undefined : desiredChainId)
        : await conn.activate(
            desiredChainId === -1 ? undefined : chainToChainParams(rawChainFor(desiredChainId)),
          );
      setVisible(false);
    }
  };

  useEffect(() => {
    if (address) {
      setVisible(false);
      setIsSupportedChain(true);
    }
  }, [address, setVisible]);

  useEffect(() => {
    const { ethereum } = window as any;
    setEthereum(ethereum);
    setDesiredChainId(+ethereum.chainId);

    if (!triedEager && !address) {
      connectorsAndHooks.forEach((c) => {
        c[0].connectEagerly && c[0].connectEagerly();
      });
      setTriedEager(true);
    }
  }, []);

  return (
    <Modal width="500px" {...rest}>
      <Modal.Title>{t("connection.connect")}</Modal.Title>
      <Modal.Content>
        {isSupportedChain ? (
          <Grid.Container gap={2}>
            {connectorItemPropsList.map((c, index) => {
              return (
                <Grid xs={12} key={index}>
                  <ConnectorItem
                    onClick={onConnectClick}
                    ethereum={ethereum}
                    icon={c.icon}
                    title={t(c.title)}
                    connector={c.connector}
                    hooks={c.hooks}
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
