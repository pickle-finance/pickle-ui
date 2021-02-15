import { FC } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";

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

export const NavItems: FC = () => {
  const router = useRouter();
  return (
    <div>
      <Link href="/jars" passHref>
        <NavItem active={router.pathname.startsWith("/jars")}>jars</NavItem>
      </Link>
      <Link href="/farms" passHref>
        <NavItem active={router.pathname.startsWith("/farms")}>farms</NavItem>
      </Link>
      <Link href="/stake" passHref>
        <NavItem active={router.pathname.startsWith("/stake")}>stake</NavItem>
      </Link>
      <a
        href="https://pickle.fyi"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <NavItem>FAQ</NavItem>
        <Link href="/info" passHref>
          <NavItem active={router.pathname.startsWith("/info")}>info</NavItem>
        </Link>
      </a>
    </div>
  );
};
