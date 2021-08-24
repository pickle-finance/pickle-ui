import { FC } from "react";
import { Page } from "@geist-ui/react";
import { Footer } from "../features/Footer/Footer";

const Swap: FC = () => {
  return (
    <>
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            PickleSwap
          </h1>
          <p>The PickleSwap feature has been deprecated.</p>
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Swap;
