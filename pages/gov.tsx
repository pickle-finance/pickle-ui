import { FC } from "react";
import { Page } from "@geist-ui/react";
import { TopBar } from "../features/TopBar/TopBar";
import { Footer } from "../features/Footer/Footer";

const Gov: FC = () => {
  return (
    <>
      <TopBar />
      <Page>
        <Page.Content>
          <h2>Gov</h2>
          <p>Coming soon...</p>
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Gov;
