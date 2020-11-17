import { FC } from "react";
import { Page } from "@geist-ui/react";
import { TopBar } from "../features/TopBar/TopBar";
import { Footer } from "../features/Footer/Footer";
import { Zap as ZapFeature } from "../features/Zap/Zap";

const Zap: FC = () => {
  return (
    <>
      <TopBar />
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            PickleZap
          </h1>
          <p>
            Zap from a single-asset token into a jar (to earn yield) and farm
            (to earn PICKLE), all on one page.
          </p>
          <ZapFeature />
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Zap;
