import { FC } from "react";
import { Page } from "@geist-ui/react";
import { useTranslation } from "next-i18next";
import { ChainNetwork } from "picklefinance-core";

import { Footer } from "v1/features/Footer/Footer";
import { Connection } from "v1/containers/Connection";
import { FraxFeature } from "v1/features/Frax/Frax";

const Frax: FC = () => {
  const { chainName } = Connection.useContainer();
  const { t } = useTranslation("common");

  return (
    <>
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>{t("frax.frax")}</h1>
          <p>{t("frax.description")}</p>
          {chainName !== ChainNetwork.Ethereum ? t("frax.connectionPrompt") : <FraxFeature />}
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export { getStaticProps } from "v1/util/locales";

export default Frax;
