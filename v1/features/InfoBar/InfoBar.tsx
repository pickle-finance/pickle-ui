import { FC } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

const MaxWidthWrapper = styled.div`
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: auto;
`;

const Content = styled.div`
  padding: 0 1.5rem 1.5rem 0;
  display: flex;
  align-items: center;
`;

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

  text-shadow: ${(props) => (props.active ? "var(--link-hover-glow)" : "unset")};

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

export const InfoBar: FC = () => {
  const router = useRouter();
  const { t } = useTranslation("common");

  return (
    <div>
      <MaxWidthWrapper>
        <Content>
          <Link href="/v1/info" passHref>
            <NavItem active={router.pathname.endsWith("/info")}>{t("nav.info")}</NavItem>
          </Link>
          <Link href="/v1/info/earn" passHref>
            <NavItem active={router.pathname.endsWith("/info/earn")}>{t("nav.profit")}</NavItem>
          </Link>
          <Link href="/v1/info/jars" passHref>
            <NavItem active={router.pathname.endsWith("/info/jars")}>{t("nav.jars")}</NavItem>
          </Link>
        </Content>
      </MaxWidthWrapper>
    </div>
  );
};
