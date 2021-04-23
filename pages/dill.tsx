import { FC } from "react";
import { Page } from "@geist-ui/react";
import { TopBar } from "../features/TopBar/TopBar";
import { Footer } from "../features/Footer/Footer";
import { DillFeature } from "../features/DILL/DILL";

const Dill: FC = () => {
  return (
    <>
      <TopBar />
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            DILL
          </h1>
          <p>
            Stake your PICKLEs to receive a portion of the profits from
            PickleJars.
          </p>
          <DillFeature />
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Dill;
