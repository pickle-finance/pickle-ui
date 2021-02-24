import { FC } from "react";
import { Page } from "@geist-ui/react";

import { TopBar } from "../features/TopBar/TopBar";
import { Footer } from "../features/Footer/Footer";
import { GaugeList } from "../features/Gauges/GaugeList";

const Gauges: FC = () => {
  return (
    <>
      <TopBar />
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            Gauges
          </h1>
          <GaugeList />
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Gauges;
