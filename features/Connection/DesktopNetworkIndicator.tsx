import { FC, useState } from "react";
import { useRouter } from "next/router";
import styled, { keyframes } from "styled-components";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import Skeleton from "@material-ui/lab/Skeleton";

import { Connection } from "../../containers/Connection";
import { Modal, Select, Tooltip } from "@geist-ui/react";
import { config, NETWORK_NAMES } from "../../containers/config";

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
`;

const AddressLabel = styled.div`
  color: #aaa;
  font-size: 15px;
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
  font-size: 12px;
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
  } = Connection.useContainer();
  const [switchChainModalOpen, setSwitchChainModalOpen] = useState(false);
  const [switchChainName, setSwitchChainName] = useState("");
  const [reset, setReset] = useState(0);
  const router = useRouter();

  const shortAddress = `${address?.substr(0, 5)}…${address?.substr(-4)}`;

  const handleSwitchChain = async (newChainId: number) => {
    if (chainId === newChainId) return;
    if (!window.ethereum?.selectedAddress) {
      setSwitchChainModalOpen(true);
    }

    const success = await switchChain(newChainId);
    if (!success) {
      setSwitchChainName(config.chains[newChainId].name);
      setSwitchChainModalOpen(true);
    }
  };

  const handleLanguageSwitch = (locale: string) =>
    router.push("", "", { locale });

  return (
    <Container>
      <Modal
        open={switchChainModalOpen}
        onClose={() => {
          setSwitchChainModalOpen(false);
          setReset(reset + 1);
        }}
      >
        <Modal.Title>Change Network</Modal.Title>
        <Modal.Content>
          {!window.ethereum?.selectedAddress
            ? `Please connect to MetaMask to use Pickle on Polygon`
            : `Please switch to ${switchChainName} Network`}
        </Modal.Content>
        <Modal.Action
          passive
          onClick={() => {
            setSwitchChainModalOpen(false);
            setReset(reset + 1);
          }}
        >
          OK
        </Modal.Action>
      </Modal>
      <Select
        value={router.locale}
        onChange={(locale) => handleLanguageSwitch(locale as string)}
        style={{
          borderRadius: "5px 0 0 5px",
          minWidth: "4rem",
          borderRight: 0,
        }}
      >
        <Select.Option value="en">EN</Select.Option>
        <Select.Option value="zh-CN">CN</Select.Option>
      </Select>
      <Select
        value={`${chainId || 1}`}
        onChange={(id) => handleSwitchChain(+id)}
        style={{
          borderRadius: "0 5px 5px 0",
          minWidth: "7rem",
          marginRight: "1.5rem",
        }}
      >
        <Select.Option value="1">Ethereum</Select.Option>
        <Select.Option value="137">Polygon</Select.Option>
      </Select>
      <AddressContainer
        href={
          chainName === NETWORK_NAMES.POLY
            ? `https://explorer-mainnet.maticvigil.com/address/${address}`
            : `https://etherscan.io/address/${address}`
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        <Address>
          <AddressLabel title={address || ""}>{shortAddress}</AddressLabel>
          <Jazzicon diameter={16} seed={jsNumberForAddress(address)} />
        </Address>
        <Block>
          <Tooltip
            text="This is the current block number. This page is updated with every new block."
            placement="left"
          >
            <BlockBox
              href={
                chainName === NETWORK_NAMES.POLY
                  ? `https://explorer-mainnet.maticvigil.com/blocks/${blockNum}`
                  : `https://etherscan.io/block/${blockNum}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
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
