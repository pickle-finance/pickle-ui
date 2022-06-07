import { FC } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter, NextRouter } from "next/router";
import { Popover } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import LanguageSelect from "../Connection/LanguageSelect";

interface NavItemProps {
  active?: boolean;
}

export const NavItem = styled.a<NavItemProps>`
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
    margin-bottom: 0.45rem;
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

const NavItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const LanguageSelectContainer = styled.div`
  @media screen and (min-width: 600px) {
    display: none;
  }
`;

const infoItems = (router: NextRouter) => {
  const { t } = useTranslation("common");

  return (
    <div style={{ padding: "0 10px" }}>
      <p>
        <Link href="/v1/info/earn" passHref>
          <NavItem active={router.pathname.endsWith("/info/earn")}>{t("nav.profit")}</NavItem>
        </Link>
      </p>
      <p>
        <Link href="/v1/info/jars" passHref>
          <NavItem active={router.pathname.endsWith("/info/jars")}>{t("nav.jars")}</NavItem>
        </Link>
      </p>
    </div>
  );
};

export const NavItems: FC = () => {
  const router = useRouter();
  const { t } = useTranslation("common");

  return (
    <>
      <NavItemsContainer>
        <Link href="/v1/farms" passHref>
          <NavItem active={router.pathname.endsWith("farms")}>{t("nav.jarsAndFarms")}</NavItem>
        </Link>
        <Link href="/v1/dill" passHref>
          <NavItem active={router.pathname.endsWith("dill")}>{t("nav.dill")}</NavItem>
        </Link>
        <Link href="/v1/frax" passHref>
          <NavItem active={router.pathname.endsWith("frax")}>{t("nav.frax")}</NavItem>
        </Link>
        <Popover content={infoItems(router)} trigger="hover" style={{ display: "flex" }}>
          <Link href="/v1/info" passHref>
            <NavItem active={router.pathname.startsWith("/v1/info")}>{t("nav.info")}</NavItem>
          </Link>
        </Popover>
        <Link href="https://feedback.pickle.finance/" passHref>
          <NavItem target="_blank" rel="noopener noreferrer">
            {t("nav.feedback")}
          </NavItem>
        </Link>
      </NavItemsContainer>
      <LanguageSelectContainer>
        <LanguageSelect type="standalone" />
      </LanguageSelectContainer>
    </>
  );
};
