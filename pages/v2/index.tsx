import { FC } from "react";

import LeftNavbar from "v2/components/LeftNavbar";
import Dashboard from "v2/components/Dashboard";
import NavbarMobile from "v2/components/NavbarMobile";

const Root: FC = () => (
  <>
    <LeftNavbar />
    <NavbarMobile />
    <Dashboard />
  </>
);

export { getStaticProps } from "../../util/locales";

export default Root;
