import { FC } from "react";
import { Page } from "@geist-ui/react";
import { TopBar } from "../features/TopBar/TopBar";
import { Footer } from "../features/Footer/Footer";
import { Stake as StakeFeature } from "../features/Stake/Stake";

const Stake: FC = () => {
  return (
    <>
      <TopBar />
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            Stake
          </h1>
          <p>
            Stake your PICKLEs to receive a portion of the profits from
            PickleJars.
          </p>
          <StakeFeature />
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Stake;
