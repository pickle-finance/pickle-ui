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
import UserFlowsAnimationsProvider from "v2/providers/UserFlowsAnimationsProvider";
import ConnectionStatus from "v2/features/connection/ConnectionStatus";
import DocsProvider from "v2/providers/DocsProvider";
import OffchainVotesProvider from "v2/providers/OffchainVotesProvider";
import BlockNumber from "v2/features/connection/BlockNumber";
import UserBalanceStatus from "v2/features/connection/UserBalancesStatus";
import Confetti from "v2/components/Confetti";

import "react-toastify/dist/ReactToastify.css";

// Custom polyfills
import "core-js/proposals/string-match-all";
import "core-js/stable/array/find-index";

type Page<P = {}> = NextPage<P> & {
  PageTitle?: FC;
  clearScreen?: boolean;
};

type Props = AppProps & {
  Component: Page;
};

const WarpSpeed: FC<Props> = ({ Component, pageProps }) => {
  const PageTitle = Component.PageTitle ?? (() => <></>);
  const clear = !!Component.clearScreen;

  return (
    <Provider store={store}>
      <Web3Provider>
        <Confetti />
        <NavbarMobile />
        <LeftNavbar />
        <main className="sm:pl-64">
          <div className="px-4 py-2 sm:px-10 sm:py-10 text-foreground">
            <TopNavbar PageTitle={PageTitle} />
            {!clear && <ConnectionStatus />}
            <Component {...pageProps} />
            <div className={clear ? "fixed bottom-0 w-10/12" : ""}>
              <div className="flex justify-between bg-background my-10">
                <UserBalanceStatus />
                <BlockNumber />
              </div>
            </div>
          </div>
        </main>
        <CoreProvider />
        <DocsProvider />
        <OffchainVotesProvider />
        <UserModelProvider />
        <UserFlowsAnimationsProvider />
      </Web3Provider>
    </Provider>
  );
};

export default WarpSpeed;
