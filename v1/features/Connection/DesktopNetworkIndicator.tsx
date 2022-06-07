import { FC, useState } from "react";
import styled, { keyframes } from "styled-components";
import Davatar from "@davatar/react";
import Skeleton from "@material-ui/lab/Skeleton";
import { useTranslation } from "next-i18next";

import { Connection } from "../../containers/Connection";
import { Modal, Select, Tooltip } from "@geist-ui/react";
import LanguageSelect from "./LanguageSelect";
import useENS from "v1/hooks/useENS";
import { PickleCore } from "v1/containers/Jars/usePickleCore";
import { MiniIcon } from "v1/components/TokenIcon";

const Container = styled.div`
  font-family: "Menlo", sans-serif;
  text-align: center;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: row;
  margin-right: 1.3rem;

  @media screen and (max-width: 600px) {
    display: none;
  }
`;

const AddressContainer = styled.a`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  border: 1px solid #666;
  border-radius: 5px;
  text-decoration: none;
  z-index: 1;
  background: var(--bg-color);

  &:hover {
    text-shadow: none;
    border: 1px solid var(--accent-color);
  }
`;

const Address = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AddressLabel = styled.div`
  color: #aaa;
  font-size: 14px;
  margin-right: 0.5rem;
`;

const Block = styled.div`
  display: flex;
  justify-content: start;
  margin-top: 6px;
`;

const BlockBox = styled.a`
  display: flex;
  align-items: center;
  justify-content: start;
  font-size: 11px;
  color: #8bc34a;
  text-decoration: none;

  &:hover {
    text-shadow: none;
    z-index: 2;
    position: relative;
    border-color: var(--accent-color);
  }

  @media screen and (max-width: 800px) {
    display: none;
  }
`;

const pulse = keyframes`
  0%   { opacity: 1; }
  50%  { opacity: 0.2; }
  100% { opacity: 1; }
`;

const BlockNumber = styled.div`
  color: #5ec591;
  text-transform: capitalize;
  text-decoration: none;
`;

const circleSize = 6;

const Circle = styled.div`
  width: ${circleSize}px;
  height: ${circleSize}px;
  min-height: ${circleSize}px;
  min-width: ${circleSize}px;
  background-color: #5ec591;
  margin-left: 0.5rem;
  margin-top: 1px;
  border-radius: 50%;
  position: relative;
  animation: ${pulse} 2s ease-in-out infinite;
`;

export const DesktopNetworkIndicator: FC = () => {
  const {
    address,
    blockNum,
    chainId,
    switchChain,
    chainName,
    provider,
  } = Connection.useContainer();
  const [switchChainModalOpen, setSwitchChainModalOpen] = useState(false);
  const [switchChainName, setSwitchChainName] = useState("");
  const [reset, setReset] = useState(0);
  const { t } = useTranslation("common");
  const { ensName } = useENS(address);
  const { pickleCore } = PickleCore.useContainer();

  const shortAddress = `${address?.substr(0, 5)}…${address?.substr(-4)}`;

  const handleSwitchChain = async (newChainId: number) => {
    if (chainId === newChainId) return;
    if (!window.ethereum?.selectedAddress) {
      setSwitchChainModalOpen(true);
    }

    const success = await switchChain(newChainId);
    if (!success) {
      const chain = pickleCore?.chains.find((x) => x.chainId === newChainId);
      const chainName = chain?.network || "";
      setSwitchChainName(chainName);
      setSwitchChainModalOpen(true);
    }
  };
  const chain =
    pickleCore === undefined || pickleCore === null
      ? undefined
      : pickleCore.chains.find((x) => x.chainId === chainId);
  let explorer = chain ? chain.explorer : undefined;
  if (explorer === undefined) {
    explorer = `https://etherscan.io`;
  }
  const renderBlock = () => {
    return `${explorer}/block/${blockNum}`;
  };

  const renderAddress = () => {
    return `${explorer}/address/${address}`;
  };

  return (
    <Container>
      <Modal
        open={switchChainModalOpen}
        onClose={() => {
          setSwitchChainModalOpen(false);
          setReset(reset + 1);
        }}
      >
        <Modal.Title>{t("connection.changeNetwork")}</Modal.Title>
        <Modal.Content>
          {!window.ethereum?.selectedAddress
            ? t("connection.connectPrompt")
            : t("connection.switchPrompt", { network: switchChainName })}
        </Modal.Content>
        <Modal.Action
          passive
          onClick={() => {
            setSwitchChainModalOpen(false);
            setReset(reset + 1);
          }}
        >
          {t("actions.ok")}
        </Modal.Action>
      </Modal>
      <LanguageSelect type="grouped" />
      <Select
        value={`${chainId || 1}`}
        onChange={(id) => handleSwitchChain(+id)}
        style={{
          borderRadius: "0 5px 5px 0",
          minWidth: "7rem",
          marginRight: "1.5rem",
          borderLeft: 0,
        }}
      >
        <Select.Option value="1">
          <MiniIcon source="/weth.png" /> {t("connection.networks.ethereum")}
        </Select.Option>
        <Select.Option value="137">
          <MiniIcon source="/matic.png" /> {t("connection.networks.polygon")}
        </Select.Option>
        <Select.Option value="66">
          <MiniIcon source="/okex.png" /> {t("connection.networks.okex")}
        </Select.Option>
        <Select.Option value="42161">
          <MiniIcon source="/arbitrum.svg" /> {t("connection.networks.arbitrum")}
        </Select.Option>
        <Select.Option value="1285">
          <MiniIcon source="/moonriver.png" /> {t("connection.networks.moonriver")}
        </Select.Option>
        <Select.Option value="25">
          <MiniIcon source="/cronos.png" /> {t("connection.networks.cronos")}
        </Select.Option>
        <Select.Option value="1313161554">
          <MiniIcon source="/aurora.png" /> {t("connection.networks.aurora")}
        </Select.Option>
        <Select.Option value="1088">
          <MiniIcon source="/metis.png" /> {t("connection.networks.metis")}
        </Select.Option>
        <Select.Option value="1284">
          <MiniIcon source="/moonbeam.png" /> {t("connection.networks.moonbeam")}
        </Select.Option>
        <Select.Option value="10">
          <MiniIcon source="/optimism.png" /> {t("connection.networks.optimism")}
        </Select.Option>
        <Select.Option value="250">
          <MiniIcon source="/fantom.png" /> {t("connection.networks.fantom")}
        </Select.Option>
        <Select.Option value="100">
          <MiniIcon source="/networks/gnosis.png" /> {t("connection.networks.gnosis")}
        </Select.Option>
      </Select>
      <AddressContainer href={renderAddress()} target="_blank" rel="noopener noreferrer">
        <Address>
          <AddressLabel title={address || ""}>{ensName || shortAddress}</AddressLabel>
          <div>
            {address && (
              <Davatar
                size={16}
                address={address}
                generatedAvatarType="jazzicon"
                provider={provider}
              />
            )}
          </div>
        </Address>
        <Block>
          <Tooltip text={t("connection.blockNumber")} placement="left">
            <BlockBox href={renderBlock()} target="_blank" rel="noopener noreferrer">
              <BlockNumber>
                {blockNum ? (
                  blockNum
                ) : (
                  <Skeleton
                    animation="wave"
                    width="55px"
                    height="16px"
                    style={{
                      backgroundColor: "#FFF",
                      opacity: 0.1,
                    }}
                  />
                )}
              </BlockNumber>
              <Circle />
            </BlockBox>
          </Tooltip>
        </Block>
      </AddressContainer>
    </Container>
  );
};
