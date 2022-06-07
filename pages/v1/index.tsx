import { FC } from "react";
import { Grid, Page } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { Balances } from "v1/features/Balances/Balances";
import { Footer } from "v1/features/Footer/Footer";
import { DepositZap } from "v1/features/Zap/DepositZap";

const Home: FC = () => {
  const { t } = useTranslation("common");

  return (
    <Page>
      <Page.Content>
        <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>{t("meta.title")}</h1>
        <Grid.Container gap={2}>
          <Grid xs={24} sm={24} md={16}>
            <Balances />
          </Grid>
          <Grid xs={24} sm={24} md={8}>
            <DepositZap />
          </Grid>
        </Grid.Container>
      </Page.Content>
      <Footer />
    </Page>
  );
};

export { getStaticProps } from "v1/util/locales";

export default Home;
