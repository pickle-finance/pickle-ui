import { FC } from "react";
import { Page, Spacer } from "@geist-ui/react";

import { Footer } from "../features/Footer/Footer";
import Claim from "../features/Claim/Claim";
import { Connection } from "../containers/Connection";
import { NETWORK_NAMES } from "containers/config";

const ClaimBalancer: FC = () => {
  const { chainName } = Connection.useContainer();

  if (chainName !== NETWORK_NAMES.ARB)
    return (
      <Page>
        <Page.Content>
          Please switch to Arbitrum to claim Balancer rewards.
        </Page.Content>
      </Page>
    );

  return (
    <Page>
      <Page.Content>
        <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
          Claim Balancer Rewards
        </h1>
        <Claim token="PICKLE" />
        <Spacer />
        <Claim token="BAL" />
        <Spacer />
        <Claim token="MCB" />
      </Page.Content>
      <Footer />
    </Page>
  );
};

export { getStaticProps } from "../util/locales";

export default ClaimBalancer;
