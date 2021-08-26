import { FC } from "react";
import { Page } from "@geist-ui/react";

import { Footer } from "../features/Footer/Footer";
import { JarList } from "../features/Jars/JarList";

const Jars: FC = () => (
  <>
    <Page>
      <Page.Content>
        <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
          Jars
        </h1>
        <JarList />
      </Page.Content>
      <Footer />
    </Page>
  </>
);

export default Jars;
