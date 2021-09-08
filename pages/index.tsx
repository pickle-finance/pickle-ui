import { FC } from "react";
import { Grid, Page } from "@geist-ui/react";
import { Balances } from "../features/Balances/Balances";
import { Footer } from "../features/Footer/Footer";
import { DepositZap } from "../features/Zap/DepositZap";
import { GetStaticPropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Home: FC = () => (
  <Page>
    <Page.Content>
      <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
        The Future of Finance is Green
      </h1>
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

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => {
  const locales = await serverSideTranslations(locale!, ["common"]);

  return {
    props: {
      ...locales,
    },
  };
};

export default Home;
