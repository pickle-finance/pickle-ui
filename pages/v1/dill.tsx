import { FC } from "react";
import { Page } from "@geist-ui/react";
import { useTranslation } from "next-i18next";
import { ChainNetwork } from "picklefinance-core";

import { Footer } from "v1/features/Footer/Footer";
import { DillFeature } from "v1/features/DILL/DILL";
import { Connection } from "v1/containers/Connection";

const Dill: FC = () => {
  const { chainName } = Connection.useContainer();
  const { t } = useTranslation("common");

  return (
    <>
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>{t("dill.dill")}</h1>
          <p>{t("dill.description")}</p>
          {chainName !== ChainNetwork.Ethereum ? t("dill.connectionPrompt") : <DillFeature />}
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export { getStaticProps } from "v1/util/locales";

export default Dill;
