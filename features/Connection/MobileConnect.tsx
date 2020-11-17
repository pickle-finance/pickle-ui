import { FC } from "react";
import styled from "styled-components";
import { Connection } from "../../containers/Connection";

const Container = styled.button`
  color: var(--bg-color);
  background: var(--accent-color);
  height: 3rem;
  width: 100%;
  border: none;
  font-family: "Source Code Pro", sans-serif;
  text-align: center;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 1rem;

  &:hover,
  &:focus {
    background: white;
  }

  display: none;
  @media screen and (max-width: 600px) {
    display: block;
  }
`;

export const MobileConnect: FC = () => {
  const { connect } = Connection.useContainer();
  return <Container onClick={connect}>CONNECT WALLET</Container>;
};
