import styled, { css } from "styled-components";
import Loader from "react-loader-spinner";
import { FC, MouseEventHandler } from "react";
import { Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";

interface ConnectorItemProps {
  icon: string;
  title: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  loading: boolean;
  disabled: boolean;
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
  loading,
  disabled,
  connector,
  hooks,
}) => {
  const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks
  const chainId = useChainId()
  const accounts = useAccounts()
  const error = useError()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  
  return (
    <StyledContainer onClick={onClick} disabled={loading || disabled}>
      {loading && (
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
