import { FC } from "react";

import Navbar from "v2/components/Navbar";
import Dashboard from "v2/components/Dashboard";
import NavbarMobile from "v2/components/NavbarMobile";

const Root: FC = () => (
  <>
    <Navbar />
    <NavbarMobile />
    <Dashboard />
  </>
);

export { getStaticProps } from "../../util/locales";

export default Root;
