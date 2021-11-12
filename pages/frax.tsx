import { FC } from "react";
import { Page } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { Footer } from "../features/Footer/Footer";
import { Connection } from "../containers/Connection";
import { NETWORK_NAMES } from "containers/config";
import { FraxFeature } from "features/Frax/Frax";

const Frax: FC = () => {
  const { chainName } = Connection.useContainer();
  const { t } = useTranslation("common");

  return (
    <>
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            {t("frax.frax")}
          </h1>
          <p>{t("frax.description")}</p>
          {chainName !== NETWORK_NAMES.ETH ? (
            t("frax.connectionPrompt")
          ) : (
            <FraxFeature />
          )}
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export { getStaticProps } from "../util/locales";

export default Frax;
