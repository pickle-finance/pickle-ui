import { FC, useState } from "react";
import styled, { keyframes } from "styled-components";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
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

const AddressBox = styled.a`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid #666;
  border-radius: 5px;
  text-decoration: none;
  z-index: 1;
  background: var(--bg-color);
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;

  &:hover {
    text-shadow: none;
    border: 1px solid var(--accent-color);
  }
`;

const AddressLabel = styled.div`
  color: #aaa;
  margin-right: 0.5rem;
`;

const BlockBox = styled.a`
  display: flex;
  align-items: center;
  color: #8bc34a;
  background: #161616;
  padding: 0.5rem 1rem;
  border: 1px solid #004221;
  border-top-left-radius: 5px;
  transform: translateX(4px);
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
  0% { background-color: #5ec591; }
  50% { background-color: #7fa491; }
  100% { background-color: #5ec591; }
`;

const BlockNumber = styled.div`
  color: #5ec591;
  text-transform: capitalize;
  text-decoration: none;
`;

const Circle = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
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
      {blockNum && (
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
            <BlockNumber>{blockNum + ` `}</BlockNumber>
            <Circle />
          </BlockBox>
        </Tooltip>
      )}
      <Select
        value={`${chainId || 1}`}
        onChange={(id) => handleSwitchChain(+id)}
        key={reset}
      >
        <Select.Option value="1">Ethereum</Select.Option>
        <Select.Option value="137">Polygon</Select.Option>
      </Select>
      <AddressBox
        href={
          chainName === NETWORK_NAMES.POLY
            ? `https://explorer-mainnet.maticvigil.com/address/${address}`
            : `https://etherscan.io/address/${address}`
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        <AddressLabel title={address || ""}>{shortAddress}</AddressLabel>
        <Jazzicon diameter={16} seed={jsNumberForAddress(address)} />
      </AddressBox>
    </Container>
  );
};
