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
        href="https://analytics.sushi.com/pairs/0x269db91fc3c7fcc275c2e6f22e5552504512811c"
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
