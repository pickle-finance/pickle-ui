import { Page } from "@geist-ui/react";
import { FC } from "react";
import styled from "styled-components";

const Container = styled(Page.Footer)`
  text-align: center;
  padding-top: 2.5rem;
  padding-bottom: 5rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const NavItem = styled.a`
  font-family: "Source Code Pro", sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  margin: 0.5rem;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 4px;
  position: relative;
  padding: 0 8px;

  @media screen and (max-width: 600px) {
    padding: 0;
    letter-spacing: 2px;
  }
`;

export const Footer: FC = () => {
  return (
    <Container>
      <NavItem
        target="_blank"
        rel="noopener noreferrer"
        href="https://app.sushi.com/swap#/swap?inputCurrency=0x429881672b9ae42b8eba0e26cd9c73711b891ca5&outputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      >
        PICKLE-ETH
      </NavItem>
      <NavItem
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/pickle-finance/contracts"
      >
        Github
      </NavItem>
      <NavItem
        target="_blank"
        rel="noopener noreferrer"
        href="https://snapshot.org/#/pickle.eth"
      >
        Signal
      </NavItem>
      <NavItem
        target="_blank"
        rel="noopener noreferrer"
        href="https://forum.pickle.finance"
      >
        Forum
      </NavItem>
      <NavItem
        target="_blank"
        rel="noopener noreferrer"
        href="http://discord.gg/uG6WhYkM8n"
      >
        Discord
      </NavItem>
      <NavItem
        target="_blank"
        rel="noopener noreferrer"
        href="https://twitter.com/picklefinance"
      >
        Twitter
      </NavItem>
      <NavItem
        target="_blank"
        rel="noopener noreferrer"
        href="https://picklefinance.medium.com/"
      >
        Medium
      </NavItem>
      <NavItem
        target="_blank"
        rel="noopener noreferrer"
        href="https://docs.pickle.finance"
      >
        DOCS
      </NavItem>
    </Container>
  );
};
