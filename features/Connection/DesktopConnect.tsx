import { FC } from "react";
import styled from "styled-components";
import { Connection } from "../../containers/Connection";

const Connect = styled.button`
  color: var(--bg-color);
  background: var(--accent-color);
  height: 100%;
  border: none;
  position: absolute;
  bottom: 0;
  top: 0;
  right: 0;
  padding: 1.5rem 3rem;
  cursor: pointer;
  text-transform: uppercase;
  font-family: "Source Code Pro", sans-serif;
  font-size: 1rem;

  &:hover,
  &:focus {
    background: white;
  }

  @media screen and (max-width: 600px) {
    display: none;
  }
`;

export const DesktopConnect: FC = () => {
  const { connect } = Connection.useContainer();
  return (
    <>
      <Connect onClick={connect}>Connect Wallet</Connect>
    </>
  );
};
