import { FC } from "react";
import { Provider } from "react-redux";
import type { NextPage } from "next";
import type { AppProps } from "next/app";

import NavbarMobile from "v2/components/NavbarMobile";
import LeftNavbar from "v2/components/LeftNavbar";
import TopNavbar from "v2/components/TopNavbar";
import { store } from "v2/store";
import CoreProvider from "v2/providers/CoreProvider";
import Web3Provider from "v2/providers/Web3Provider";
import UserModelProvider from "v2/providers/UserModelProvider";
import ConnectionStatus from "v2/features/connection/ConnectionStatus";
import BlockNumber from "v2/features/connection/BlockNumber";

type Page<P = {}> = NextPage<P> & {
  PageTitle?: FC;
};

type Props = AppProps & {
  Component: Page;
};

const WarpSpeed: FC<Props> = ({ Component, pageProps }) => {
  const PageTitle = Component.PageTitle ?? (() => <></>);

  return (
    <Provider store={store}>
      <Web3Provider>
        <NavbarMobile />
        <LeftNavbar />
        <main className="sm:pl-64">
          <div className="px-4 py-2 sm:px-10 sm:py-10 text-white">
            <TopNavbar PageTitle={PageTitle} />
            <ConnectionStatus />
            <Component {...pageProps} />
            <BlockNumber />
          </div>
        </main>
        <CoreProvider />
        <UserModelProvider />
      </Web3Provider>
    </Provider>
  );
};

export default WarpSpeed;
