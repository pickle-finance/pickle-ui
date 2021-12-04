import { FC } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";

import NavbarMobile from "v2/components/NavbarMobile";
import LeftNavbar from "v2/components/LeftNavbar";
import TopNavbar from "v2/components/TopNavbar";

type Page<P = {}> = NextPage<P> & {
  PageTitle?: FC;
};

type Props = AppProps & {
  Component: Page;
};

const WarpSpeed: FC<Props> = ({ Component, pageProps }) => {
  const PageTitle = Component.PageTitle ?? (() => <></>);

  return (
    <>
      <NavbarMobile />
      <LeftNavbar />
      <main className="sm:pl-64">
        <div className="px-4 py-2 sm:px-10 sm:py-10 text-white">
          <TopNavbar PageTitle={PageTitle} />
          <Component {...pageProps} />
        </div>
      </main>
    </>
  );
};

export default WarpSpeed;
