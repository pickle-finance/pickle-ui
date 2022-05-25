import { FC } from "react";
import styled, { keyframes } from "styled-components";
import { Connection } from "../../containers/Connection";
import Davatar from "@davatar/react";
import { PickleCore } from "v1/containers/Jars/usePickleCore";

const Container = styled.div`
  display: none;

  @media screen and (max-width: 600px) {
    background: #252525;
    height: 3rem;
    width: 100%;
    padding: 1rem;
    font-family: "Menlo", sans-serif;
    text-align: center;

    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  color: #8bc34a;
`;

const AddressLabel = styled.div`
  color: #aaa;
  margin-left: 0.5rem;
`;

const pulse = keyframes`
  0% { background-color: #8bc34a; }
  50% { background-color: #889778; }
  100% { background-color: #8bc34a; }
`;

const BlockNumber = styled.div`
  color: #8bc34a;
  text-transform: capitalize;
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

const ConnectContainer = styled.div`
  display: flex;
  a {
    margin-left: 10px;
  }
`;

export const MobileNetworkIndicator: FC = () => {
  const { address, chainId, provider } = Connection.useContainer();
  const { pickleCore } = PickleCore.useContainer();

  const shortAddress = `${address?.substr(0, 5)}…${address?.substr(-4)}`;
  const networkName = chainId ? pickleCore?.chains.find((x) => x.chainId === chainId)?.network : "";
  return (
    <Container>
      <Left>
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
        <AddressLabel title={address || ""}>{shortAddress}</AddressLabel>
      </Left>
      <ConnectContainer>
        <Right>
          <BlockNumber>{networkName + ` `}</BlockNumber>
          <Circle />
        </Right>
      </ConnectContainer>
    </Container>
  );
};
