import styled, { css } from "styled-components";
import Loader from "react-loader-spinner";
import { FC } from "react";

interface ConnectorItemProps {
  icon: string;
  title: string;
  onClick: Function;
  loading: boolean;
  disabled: boolean;
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

const centerStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};

const ConnectorItem: FC<ConnectorItemProps> = ({
  icon,
  title,
  onClick,
  loading,
  disabled,
}) => {
  return (
    <StyledContainer
      style={{
        width: "100%",
        height: "100%",
      }}
      onClick={onClick}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      disabled={loading || disabled}
    >
      {loading && (
        <Loader
          type="TailSpin"
          color="#aaa"
          height={50}
          width={50}
          style={centerStyle}
        />
      )}
      <img src={`wallet/${icon}`} width="30px" alt="wallet" />
      {title}
    </StyledContainer>
  );
};

export default ConnectorItem;
