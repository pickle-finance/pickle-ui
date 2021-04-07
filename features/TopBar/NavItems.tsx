import { FC } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";
import { Popover } from "@geist-ui/react";

interface NavItemProps {
  active?: boolean;
}

const NavItem = styled.a<NavItemProps>`
  font-family: "Source Code Pro", sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 4px;
  position: relative;
  padding: 0 8px;

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

const infoItems = (router) => (
  <div style={{ padding: '0 10px' }}>
  <p><Link href="/info/earn" passHref><NavItem active={router.pathname.startsWith("/info/earn")}>Profit</NavItem></Link></p>
  <p><Link href="/info/jars" passHref><NavItem active={router.pathname.startsWith("/info/jars")}>Jars</NavItem></Link></p>
  <p><Link href="/info/stats" passHref><NavItem active={router.pathname.startsWith("/info/stats")}>Stats</NavItem></Link></p>
</div>
);

export const NavItems: FC = () => {
  const router = useRouter();
  return (
    <div>
      <Link href="/jars" passHref>
        <NavItem active={router.pathname.startsWith("/jars")}>jars</NavItem>
      </Link>
      
      <Link href="/farms" passHref>
        <NavItem active={router.pathname.endsWith("farms")}>farms</NavItem>
      </Link>
      <Link href="/dill" passHref>
        <NavItem active={router.pathname.startsWith("/dill")}>dill</NavItem>
      </Link>
      <Link href="/stake" passHref>
        <NavItem active={router.pathname.startsWith("/stake")}>stake</NavItem>
      </Link>
      <a
        href="https://docs.pickle.finance/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <NavItem>FAQ</NavItem>
      </a>
      <Popover content={infoItems(router)} trigger="hover">
        <Link href="/info" passHref>
          <NavItem active={router.pathname.startsWith("/info")}>info</NavItem>
        </Link>
      </Popover>
    </div>
  );
};
