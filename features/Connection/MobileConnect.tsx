import { FC } from "react";
import styled from "styled-components";
import { useModal } from "@geist-ui/react";
import { Web3Modal } from "./Web3Modal";

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
  const { setVisible, bindings } = useModal();
  return (
    <>
      <Container onClick={() => setVisible(true)}>CONNECT WALLET</Container>
      <Web3Modal setVisible={setVisible} {...bindings} />
    </>
  );
};
