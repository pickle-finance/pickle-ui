import { FC } from "react";
import { Page, Note } from "@geist-ui/react";
import Link from "next/link";
import { TopBar } from "../features/TopBar/TopBar";
import { Footer } from "../features/Footer/Footer";
import { GaugeList } from "../features/Gauges/GaugeList";
import { MiniFarmList } from "../features/MiniFarms/MiniFarmList";
import { Connection } from "../containers/Connection";
import { NETWORK_NAMES } from "containers/config";

const Gauges: FC = () => {
  const { chainName } = Connection.useContainer();

  return (
    <>
      <TopBar />
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            Farms
          </h1>
          {chainName === NETWORK_NAMES.POLY ? (
            <MiniFarmList />
          ) : (
            <GaugeList />
          )}
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Gauges;
