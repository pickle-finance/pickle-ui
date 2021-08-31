import { FC } from "react";
import { Grid, Page } from "@geist-ui/react";
import { Balances } from "../features/Balances/Balances";
import { Prices } from "../features/Prices/Prices";
import { Footer } from "../features/Footer/Footer";
import { Zap } from "../features/Zap/Zap";
import { DepositZap } from "../features/Zap/DepositZap";
import { Connection } from "containers/Connection";
import { NETWORK_NAMES } from "containers/config";

const Home: FC = () => {
  const { chainName } = Connection.useContainer();

  return (
    <>
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
            <Grid xs={24} sm={24} md={24}>
              {chainName === NETWORK_NAMES.POLY ? null : <Zap />}
            </Grid>
          </Grid.Container>
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Home;
