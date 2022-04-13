import styled, { css } from "styled-components";
import Loader from "react-loader-spinner";
import { FC, MouseEventHandler, useEffect } from "react";
import { Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";

interface ConnectorItemProps {
  icon: string;
  title: string;
  onClick: Function; //MouseEventHandler<HTMLDivElement>;
  ethereum: any;
  connector: Connector;
  hooks: Web3ReactHooks;
}

interface ContainerProps {
  disabled: boolean;
}

const StyledContainer = styled.div<ContainerProps>`
  width: 100%;
  padding: 0.6rem 0;
  height: 100%;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1rem;
  &:hover {
    background-color: #22332a;
  }
  ${({ disabled }) =>
    disabled &&
    css`
      filter: grayscale(1);
      opacity: 0.5;
      cursor: not-allowed;
      &:active {
        pointer-events: none;
      }
    `}
  img {
    margin-right: 10px;
  }
`;

const LoaderContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const ConnectorItem: FC<ConnectorItemProps> = ({
  icon,
  title,
  onClick,
  ethereum,
  connector,
  hooks,
}) => {
  const { useError, useIsActivating, useIsActive } = hooks;
  const error = useError();
  const isActivating = useIsActivating();
  const isActive = useIsActive();

  // attempt to connect eagerly on mount
  useEffect(() => {
    if (connector.connectEagerly) void connector.connectEagerly();
  }, []);

  return (
    <StyledContainer
      onClick={() => onClick(connector, error, isActivating, isActive)}
      disabled={isActivating || !ethereum}
    >
      {isActivating && (
        <LoaderContainer>
          <Loader type="TailSpin" color="#aaa" height={50} width={50} />
        </LoaderContainer>
      )}
      <img src={`/wallet/${icon}`} width="30px" alt="wallet" />
      {title}
    </StyledContainer>
  );
};

export default ConnectorItem;
