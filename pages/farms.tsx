import { FC } from "react";
import { Page } from "@geist-ui/react";

import { TopBar } from "../features/TopBar/TopBar";
import { Footer } from "../features/Footer/Footer";
import { FarmList } from "../features/Farms/FarmList";

const Farms: FC = () => {
  return (
    <>
      <TopBar />
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            Farms
          </h1>
          <FarmList />
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Farms;
