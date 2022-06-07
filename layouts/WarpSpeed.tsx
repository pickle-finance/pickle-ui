import { FC, useEffect } from "react";
import { Provider } from "react-redux";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

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
import ErrorBoundary from "v2/components/ErrorBoundary";

import "react-toastify/dist/ReactToastify.css";

// Custom polyfills
import "core-js/proposals/string-match-all";
import "core-js/stable/array/find-index";
import V1LinkCard from "v2/components/V1LinkCard";

type Page<P = {}> = NextPage<P> & {
  PageTitle?: FC;
};

type Props = AppProps & {
  Component: Page;
};

const WarpSpeed: FC<Props> = ({ Component, pageProps }) => {
  const PageTitle = Component.PageTitle ?? (() => <></>);
  const { asPath } = useRouter();

  useEffect(() => {
    document.querySelector("body")!.classList.remove("classic");
  }, []);

  return (
    <Provider store={store}>
      <Web3Provider>
        <Confetti />
        <NavbarMobile />
        <LeftNavbar />
        <main className="sm:pl-64">
          <div className="px-4 py-2 sm:px-10 sm:py-10 text-foreground">
            <TopNavbar PageTitle={PageTitle} />
            <ConnectionStatus />
            <V1LinkCard />
            <ErrorBoundary key={asPath}>
              <Component {...pageProps} />
            </ErrorBoundary>
            <div className="flex justify-between bg-background mt-4 mb-8">
              <UserBalanceStatus showDetails />
              <BlockNumber />
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
