import { FC } from "react";
import { Page } from "@geist-ui/react";

import { TopBar } from "../features/TopBar/TopBar";
import { Footer } from "../features/Footer/Footer";
import { JarList as JarListEthereum } from "../features/Jars-Ethereum/JarList";
import { JarList as JarListPolygon } from "../features/Jars-Polygon/JarList";
import { Connection } from "../containers/Connection";

const Jars: FC = () => {
  const { chainName } = Connection.useContainer();

  return (
    <>
      <TopBar />
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            Jars
          </h1>
          {chainName === "Polygon" ? <JarListPolygon /> : <JarListEthereum />}
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Jars;
