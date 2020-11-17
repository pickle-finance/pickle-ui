import { FC } from "react";
import { Page } from "@geist-ui/react";
import { TopBar } from "../features/TopBar/TopBar";
import { Footer } from "../features/Footer/Footer";
import { Swap as Swapper } from "../features/Swap/Swap";

const Swap: FC = () => {
  return (
    <>
      <TopBar />
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            PickleSwap
          </h1>
          <p>Swap your assets from one jar to another.</p>
          <Swapper />
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Swap;
