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
import { ErrorMessage } from "v2/components/ErrorBoundary";
import * as Sentry from "@sentry/react";

import "react-toastify/dist/ReactToastify.css";

// Custom polyfills
import "core-js/proposals/string-match-all";
import "core-js/stable/array/find-index";
import V1LinkCard from "v2/components/V1LinkCard";
import { classNames } from "v2/utils";
import Button from "v2/components/Button";

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

            {/* <ErrorBoundary key={asPath}> */}
            <Sentry.ErrorBoundary
              fallback={({ error, componentStack, resetError }) => {
                console.log("error", error);
                console.log("componentStack", componentStack);
                return (
                  <div className="flex justify-center items-center py-8 lg:py-32">
                    <div
                      className={classNames(
                        "bg-background-light w-4/5 lg:w-1/2 max-w-xl rounded-xl border border-foreground-alt-500 shadow p-6 md:p-12",
                      )}
                    >
                      <div className="flex justify-center mt-2">
                        <div className="w-3/5 lg:w-1/2 min-h-[200px]">
                          <img src="/animations/failure.gif" />
                        </div>
                      </div>
                      <div className="w-full text-center mb-8">
                        <p className="break-normal text-foreground-alt-200">{error}</p>
                      </div>
                      <div className="flex justify-center">
                        <Button href="https://discord.gg/pickle-finance">Discord</Button>
                      </div>
                    </div>
                  </div>
                );
              }}
            >
              <Component {...pageProps} />
            </Sentry.ErrorBoundary>
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
