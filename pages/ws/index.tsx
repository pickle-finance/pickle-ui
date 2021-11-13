import { FC } from "react";

import Navbar from "../../ws/components/Navbar";
import Dashboard from "../../ws/components/Dashboard";
import NavbarMobile from "../../ws/components/NavbarMobile";

const Root: FC = () => (
  <>
    <Navbar />
    <NavbarMobile />
    <Dashboard />
  </>
);

export { getStaticProps } from "../../util/locales";

export default Root;
