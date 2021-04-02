import { FC } from "react";
import styled, { keyframes } from "styled-components";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Connection } from "../../containers/Connection";
import { Tooltip } from "@geist-ui/react";
import { Popover } from "@geist-ui/react";
import { useWeb3React } from "@web3-react/core";

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

const AddressBook = styled.div`
  display: flex;
  align-items: center;
`;

const ConnectedPopover = styled(Popover)`
  padding: 0.5rem 1rem;
  border: 1px solid #666;
  border-radius: 5px;
  cursor: pointer;
  z-index: 2;
  background: var(--bg-color);
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;

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

interface MenuItemProps {
  active?: boolean;
}

const MenuItem = styled.a<MenuItemProps>`
  font-family: "Source Code Pro", sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  cursor: pointer;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 4px;
  position: relative;
  padding: 0.5rem;

  text-shadow: ${(props) =>
    props.active ? "var(--link-hover-glow)" : "unset"};

  @media screen and (max-width: 600px) {
    padding: 0;
    letter-spacing: 2px;
  }

  &::after {
    content: "";
    border-bottom: 2px solid rgb(83, 255, 226);
    box-shadow: rgb(83, 255, 226) 0px 0px 8px;
    display: ${(props) => (props.active ? "block" : "none")};
    position: absolute;
    right: 4px;
    left: 0px;
    bottom: -4px;

    @media screen and (max-width: 600px) {
      right: 2px;
    }
  }
`;
const AddressMenu = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DesktopNetworkIndicator: FC = () => {
  const { deactivate } = useWeb3React();
  const { address, blockNum } = Connection.useContainer();
  const shortAddress = `${address?.substr(0, 5)}…${address?.substr(-4)}`;

  return (
    <Container>
      {blockNum && (
        <Tooltip
          text="This is the current block number. This page is updated with every new block."
          placement="left"
        >
          <BlockBox
            href={`https://etherscan.io/block/${blockNum}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <BlockNumber>{blockNum + ` `}</BlockNumber>
            <Circle />
          </BlockBox>
        </Tooltip>
      )}
      <ConnectedPopover
        content={
          <AddressMenu>
            <MenuItem
              href={`https://etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Etherscan
            </MenuItem>
            <MenuItem
              onClick={() => {
                deactivate();
              }}
            >
              Disconnect
            </MenuItem>
          </AddressMenu>
        }
        trigger="hover"
      >
        <AddressBook>
          <AddressLabel title={address || ""}>{shortAddress}</AddressLabel>
          <Jazzicon diameter={16} seed={jsNumberForAddress(address)} />
        </AddressBook>
      </ConnectedPopover>
    </Container>
  );
};
