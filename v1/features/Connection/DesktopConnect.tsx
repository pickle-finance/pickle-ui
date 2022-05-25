import { FC } from "react";
import styled from "styled-components";
import { useModal } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { Web3Modal } from "./Web3Modal";

const Connect = styled.button`
  color: var(--bg-color);
  background: var(--accent-color);
  height: 100%;
  border: none;
  bottom: 0;
  top: 0;
  right: 0;
  padding: 1.5rem 3rem;
  cursor: pointer;
  text-transform: uppercase;
  font-family: "Source Code Pro", sans-serif;
  font-size: 1rem;
  margin-left: 2rem;

  &:hover,
  &:focus {
    background: white;
  }
`;

export const DesktopConnect: FC = () => {
  const { setVisible, bindings } = useModal();
  const { t } = useTranslation("common");

  return (
    <>
      <Connect onClick={() => setVisible(true)}>{t("connection.connect")}</Connect>
      <Web3Modal setVisible={setVisible} {...bindings} />
    </>
  );
};
