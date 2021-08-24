import { FC } from "react";
import { Page, Note, Grid, Spacer } from "@geist-ui/react";
import { ArrowLeft } from "@geist-ui/react-icons";

import Link from "next/link";
import { Footer } from "../features/Footer/Footer";
import { FarmList } from "../features/Farms/FarmList";

const Farms: FC = () => {
  return (
    <>
      <Page>
        <Page.Content>
          {/* <strong>
            <Link href="/farms" style={{ color: "var(--link-color)" }}>
              <span>
                <ArrowLeft size={13} />
                <Spacer x={0.3} inline /> to new Farms
              </span>
            </Link>
          </strong> */}
          <Link href="/farms" passHref>
            <a style={{ textDecoration: "none" }}>
              {" "}
              <strong>
                <ArrowLeft size={13} /> to new Farms{" "}
              </strong>
            </a>
          </Link>
          <Spacer />
          <Note type="warning" style={{ textAlign: "center" }}>
            These Farms stopped earning $PICKLEs on Thu, Apr 22, 2021 (12 AM
            GMT)
            <br />
            To earn $PICKLEs, migrate any tokens here to the new Farms
            <br />
            Expand on any Farm you have tokens, and click{" "}
            <strong>Migrate</strong>
          </Note>

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
