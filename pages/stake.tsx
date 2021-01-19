import { FC } from "react";
import { Page, Note, Link } from "@geist-ui/react";
import { TopBar } from "../features/TopBar/TopBar";
import { Footer } from "../features/Footer/Footer";
import { Stake as StakeFeature } from "../features/Stake/Stake";

const Stake: FC = () => {
  return (
    <>
      <TopBar />
      <Page>
        <Page.Content>
          <Note type="warning">
            Staking has ended and you are welcome to unstake. More information
            can be found{" "}
            <Link
              href="https://picklefinance.medium.com/into-the-brine-vol-5-smart-treasury-and-basis-picklejar-7a4b2de35802"
              underline={true}
              style={{ textDecoration: "underline" }}
              target="_blank"
              rel="noopener"
            >
              here
            </Link>
            .
          </Note>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            Stake
          </h1>
          <p>
            Stake your PICKLEs to receive a portion of the profits from
            PickleJars.
          </p>
          <StakeFeature />
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Stake;
