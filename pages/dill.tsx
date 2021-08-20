import { FC } from "react";
import { Page } from "@geist-ui/react";
import { Footer } from "../features/Footer/Footer";
import { DillFeature } from "../features/DILL/DILL";
import { Connection } from "../containers/Connection";

const Dill: FC = () => {
  const { chainName } = Connection.useContainer();

  return (
    <>
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            DILL
          </h1>
          <p>
            Stake your PICKLEs to receive a portion of the profits from
            PickleJars.
          </p>
          {chainName === "Polygon" ? (
            "Please switch to Ethereum network to use DILL features."
          ) : (
            <DillFeature />
          )}
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Dill;
